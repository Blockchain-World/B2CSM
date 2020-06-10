package b2csm.honeypots;

import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.ArrayUtils;

import b2csm.config.CONFIG;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class HoneypotsDatasetToChain {

    private static final Log log = LogFactory.getLog(HoneypotsDatasetToChain.class);

    public static long fileSize;

    //public static final int CONFIG.HONEYPOTS_ROW_UNIT = 16; // the number of rows in each data unit
    //public static final int CONFIG.HONEYPOTS_COLUMN_UNIT = 16; // the number of columns in each data unit

    public static List<String> importCSV(File file) {
        List<String> dataList = new ArrayList<>();

        BufferedReader br = null;
        try {
            br = new BufferedReader(new FileReader(file));
            String line = "";
            while ((line = br.readLine()) != null) {
                dataList.add(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                    br = null;
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return dataList;
    }

    public static ArrayList<JSONObject> ImportCSV(String dayTime, String datasetName){
        int datasetRows = 0; // the number of rows in the dataset
        int datasetColumns = 0; // the number of columns in the dataset
        ArrayList<JSONObject> allDataUnits = new ArrayList<>();

        File importFile = new File( CONFIG.HONEYPOTS_DATASET_LOCATION + datasetName);
        fileSize = importFile.length();
        log.info("File size is: " + fileSize + " Bytes");
        List<String> dataList = HoneypotsDatasetToChain.importCSV(importFile); ///opt/gopath/src/b2csm/b2csm-explorer/
        if (dataList != null && !dataList.isEmpty()) {

            // get the first line as column IPs
            String[] allColumnIPs = ArrayUtils.remove(dataList.get(0).split(","), 0);
            String[] allRowIPs = new String[dataList.size() - 1];
            // get all row IPs
            for (int i = 1; i < dataList.size(); i++){
                allRowIPs[i-1] = dataList.get(i).split(",")[0];
            }
            datasetRows = allRowIPs.length;
            datasetColumns = allColumnIPs.length;
            log.info("The dataset has " + datasetRows + " rows and " + datasetColumns + " columns");

            if(datasetRows < CONFIG.HONEYPOTS_ROW_UNIT && datasetColumns < CONFIG.HONEYPOTS_COLUMN_UNIT){
                JSONObject dayUnit = new JSONObject();
                int dataUnitCounter = 0;
                dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter));
                // obtain row IPs (external IPs).
                String[] rowIPs = new String[datasetRows];
                for (int i = 1; i <= datasetRows; i++){
                    rowIPs[i-1] = dataList.get(i).split(",")[0];
                }
                // obtain column IPs (internal IPs)
                String[] columnIPs = dataList.get(0).split(",");
                columnIPs = ArrayUtils.remove(columnIPs, 0);
                // obtain day data - adjacency matrix
                String[][] dayData = new String[datasetRows][datasetColumns];
                for (int i = 1; i <= datasetRows; i++){
                    String[] dayRow = dataList.get(i).split(",");
                    dayRow = ArrayUtils.remove(dayRow, 0);
                    dayData[i - 1] = dayRow;
                }
                dayUnit.put("rowIPs", rowIPs);
                dayUnit.put("columnIPs", columnIPs);
                dayUnit.put("dayData", dayData);
                allDataUnits.add(dayUnit);
            }
            else if(datasetRows < CONFIG.HONEYPOTS_ROW_UNIT && datasetColumns > CONFIG.HONEYPOTS_COLUMN_UNIT){
                System.out.println("to be done");
                //TODO: datasetRows < CONFIG.HONEYPOTS_ROW_UNIT && datasetColumns > CONFIG.HONEYPOTS_COLUMN_UNIT
            }
            else if(datasetRows > CONFIG.HONEYPOTS_ROW_UNIT && datasetColumns < CONFIG.HONEYPOTS_COLUMN_UNIT){
                System.out.println("to be done");
                //TODO: datasetRows > CONFIG.HONEYPOTS_ROW_UNIT && datasetColumns < CONFIG.HONEYPOTS_COLUMN_UNIT
            }
            else { // datasetRows > CONFIG.HONEYPOTS_ROW_UNIT && datasetColumns > CONFIG.HONEYPOTS_COLUMN_UNIT
                boolean rowsFlag = true; // true means datasetRows % CONFIG.HONEYPOTS_ROW_UNIT == 0
                boolean columnsFlag = true; // true means datasetColumns % CONFIG.HONEYPOTS_COLUMN_UNIT == 0
                int rowsUnit = datasetRows / CONFIG.HONEYPOTS_ROW_UNIT;
                if(datasetRows % CONFIG.HONEYPOTS_ROW_UNIT != 0){
                    rowsUnit += 1;
                    rowsFlag = false;
                }
                int columnsUnit = datasetColumns / CONFIG.HONEYPOTS_COLUMN_UNIT;
                if(datasetColumns % CONFIG.HONEYPOTS_COLUMN_UNIT != 0){
                    columnsUnit += 1;
                    columnsFlag = false;
                }
                log.info("The dataset has " + rowsUnit + " rowsUnit and " + columnsUnit + " columnUnits");
                if(rowsFlag && columnsFlag){
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int dataUnitCounter = 0;
                    for (int i = 0 ; i < rowsUnit; i++){

                        String[][] dayData = new String[CONFIG.HONEYPOTS_ROW_UNIT][CONFIG.HONEYPOTS_COLUMN_UNIT];
                        String[] rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, (i+1)*CONFIG.HONEYPOTS_ROW_UNIT);

                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + (dataUnitCounter++));

                            String[] columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT);
                            // get dayData
                            for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < (i + 1) * CONFIG.HONEYPOTS_ROW_UNIT; x++){
                                // get each row
                                String[] rowTemp = dataList.get(x + 1).split(",");
                                String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT + 1);
                                dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                            }

                            dayUnit.put("rowIPs", rowIPs);
                            dayUnit.put("columnIPs", columnIPs);
                            dayUnit.put("dayData", dayData);

                            allDataUnits.add(dayUnit);
                        }
                    }
                }
                else if (rowsFlag && !columnsFlag){
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int columnLeft = datasetColumns % CONFIG.HONEYPOTS_COLUMN_UNIT;
                    int dataUnitCounter = 0;
                    log.info("The dataset has " + columnLeft + " columns left");
                    for (int i = 0 ; i < rowsUnit; i++){
                        String[][] dayData;
                        String[] rowIPs;
                        String[] columnIPs;
                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter++));
                            if(j == columnsUnit - 1){
                                System.out.println("The last column unit");
                                dayData = new String[CONFIG.HONEYPOTS_ROW_UNIT][columnLeft];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, (i + 1)*CONFIG.HONEYPOTS_ROW_UNIT);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, j*CONFIG.HONEYPOTS_COLUMN_UNIT + columnLeft);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < (i + 1) * CONFIG.HONEYPOTS_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, j*CONFIG.HONEYPOTS_COLUMN_UNIT + columnLeft + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else {
                                log.info("Full unit");
                                dayData = new String[CONFIG.HONEYPOTS_ROW_UNIT][CONFIG.HONEYPOTS_COLUMN_UNIT];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, (i+1)*CONFIG.HONEYPOTS_ROW_UNIT);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < (i + 1) * CONFIG.HONEYPOTS_ROW_UNIT; x++){
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);

                                allDataUnits.add(dayUnit);
                            }
                        }
                    }
                }
                else if (!rowsFlag && columnsFlag){
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int rowsLeft = datasetRows % CONFIG.HONEYPOTS_ROW_UNIT;
                    int dataUnitCounter = 0;
                    log.info("The dataset has " + rowsLeft + " rows left");
                    for (int i = 0 ; i < rowsUnit; i++){
                        String[][] dayData;
                        String[] rowIPs;
                        String[] columnIPs;
                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter++));
                            if(i == rowsUnit - 1){
                                log.info("The last row unit");
                                dayData = new String[rowsLeft][CONFIG.HONEYPOTS_COLUMN_UNIT];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, i*CONFIG.HONEYPOTS_ROW_UNIT + rowsLeft);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < i * CONFIG.HONEYPOTS_ROW_UNIT + rowsLeft; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }else {
                                //System.out.println("full unit...");
                                log.info("Full unit...");
                                dayData = new String[CONFIG.HONEYPOTS_ROW_UNIT][CONFIG.HONEYPOTS_COLUMN_UNIT];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, (i+1)*CONFIG.HONEYPOTS_ROW_UNIT);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < (i + 1) * CONFIG.HONEYPOTS_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                        }
                    }
                }
                else { // rowsFlag == false && columnsFlag == false
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int rowsLeft = datasetRows % CONFIG.HONEYPOTS_ROW_UNIT;
                    int columnLeft = datasetColumns % CONFIG.HONEYPOTS_COLUMN_UNIT;
                    int dataUnitCounter = 0;
                    log.info("The dataset has " + rowsLeft + " rows and " + columnLeft + " columns left");
                    for (int i = 0 ; i < rowsUnit; i++){
                        String[][] dayData;
                        String[] rowIPs;
                        String[] columnIPs;
                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter++));
                            if(i == (rowsUnit - 1) && j == (columnsUnit - 1)){
                                // if the last square
                                log.info("Start the last square");
                                dayData = new String[rowsLeft][columnLeft];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, i*CONFIG.HONEYPOTS_ROW_UNIT + rowsLeft);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, j*CONFIG.HONEYPOTS_COLUMN_UNIT + columnLeft);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < i * CONFIG.HONEYPOTS_ROW_UNIT + rowsLeft; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, j*CONFIG.HONEYPOTS_COLUMN_UNIT + columnLeft + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else if(i != (rowsUnit - 1) && j == (columnsUnit - 1)){
                                log.info("The last column unit");
                                dayData = new String[CONFIG.HONEYPOTS_ROW_UNIT][columnLeft];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, (i + 1)*CONFIG.HONEYPOTS_ROW_UNIT);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, j*CONFIG.HONEYPOTS_COLUMN_UNIT + columnLeft);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < (i + 1) * CONFIG.HONEYPOTS_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, j*CONFIG.HONEYPOTS_COLUMN_UNIT + columnLeft + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else if(i == (rowsUnit - 1) && j != (columnsUnit - 1)){
                                log.info("The last row unit");
                                dayData = new String[rowsLeft][CONFIG.HONEYPOTS_COLUMN_UNIT];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, i*CONFIG.HONEYPOTS_ROW_UNIT + rowsLeft);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < i * CONFIG.HONEYPOTS_ROW_UNIT + rowsLeft; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else {
                                //System.out.println("full square...");
                                log.info("Full square");
                                dayData = new String[CONFIG.HONEYPOTS_ROW_UNIT][CONFIG.HONEYPOTS_COLUMN_UNIT];
                                rowIPs = Arrays.copyOfRange(allRowIPs, i*CONFIG.HONEYPOTS_ROW_UNIT, (i+1)*CONFIG.HONEYPOTS_ROW_UNIT);
                                columnIPs = Arrays.copyOfRange(allColumnIPs, j*CONFIG.HONEYPOTS_COLUMN_UNIT, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT);
                                for (int x = i * CONFIG.HONEYPOTS_ROW_UNIT; x < (i + 1) * CONFIG.HONEYPOTS_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.HONEYPOTS_COLUMN_UNIT + 1, (j+1)*CONFIG.HONEYPOTS_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.HONEYPOTS_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("rowIPs", rowIPs);
                                dayUnit.put("columnIPs", columnIPs);
                                dayUnit.put("dayData", dayData);

                                allDataUnits.add(dayUnit);
                            }
                        }
                    }
                }

            }
        }
        return allDataUnits;
    }
}