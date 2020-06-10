package b2csm.gtmw;

import b2csm.config.CONFIG;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GTMWDatasetToChain {

    private static final Log log = LogFactory.getLog(GTMWDatasetToChain.class);

    public static long fileSize;

    //public static int CONFIG.GTMW_ROW_UNIT = CONFIG.GTMW_CONFIG.GTMW_ROW_UNIT; // the number of rows in each data unit
    //public static final int CONFIG.GTMW_COLUMN_UNIT = 2; // the number of columns in each data unit

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

        File importFile = new File( CONFIG.GTMW_DATASET_LOCATION + datasetName);
        fileSize = importFile.length();
        log.info("File size is: " + fileSize + " Bytes");

        List<String> dataList = GTMWDatasetToChain.importCSV(new File(CONFIG.GTMW_DATASET_LOCATION + datasetName)); ///opt/gopath/src/b2csm/b2csm-explorer/
        if (dataList != null && !dataList.isEmpty()) {

            // get the first line as column IPs
            String[] allColumnURLs = ArrayUtils.remove(dataList.get(0).split(","), 0);

            String[] allRowAPPs = new String[dataList.size() - 1];
            // get all row IPs
            for (int i = 1; i < dataList.size(); i++){
                allRowAPPs[i-1] = dataList.get(i).split(",")[0];
            }

            datasetRows = allRowAPPs.length;
            datasetColumns = allColumnURLs.length;
            log.info("The dataset has " + datasetRows + " rows and " + datasetColumns + " columns");

            if(datasetRows < CONFIG.GTMW_ROW_UNIT && datasetColumns < CONFIG.GTMW_COLUMN_UNIT){
                JSONObject dayUnit = new JSONObject();
                int dataUnitCounter = 0;
                dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter));
                // obtain row IPs (external IPs).
                String[] RowAPPs = new String[datasetRows];
                for (int i = 1; i <= datasetRows; i++){
                    RowAPPs[i-1] = dataList.get(i).split(",")[0];
                }
                // obtain column IPs (internal IPs)
                String[] ColumnURLs = dataList.get(0).split(",");
                ColumnURLs = ArrayUtils.remove(ColumnURLs, 0);

                // obtain day data - adjacency matrix
                String[][] dayData = new String[datasetRows][datasetColumns];
                for (int i = 1; i <= datasetRows; i++){
                    String[] dayRow = dataList.get(i).split(",");
                    dayRow = ArrayUtils.remove(dayRow, 0);
                    dayData[i - 1] = dayRow;
                }
                dayUnit.put("RowAPPs", RowAPPs);
                dayUnit.put("ColumnURLs", ColumnURLs);
                dayUnit.put("dayData", dayData);
                allDataUnits.add(dayUnit);
            }
            else if(datasetRows < CONFIG.GTMW_ROW_UNIT && datasetColumns > CONFIG.GTMW_COLUMN_UNIT){
                log.info("Please make sure that the number of rows is greater than " + CONFIG.GTMW_ROW_UNIT);
                //TODO: datasetRows < CONFIG.GTMW_ROW_UNIT && datasetColumns > CONFIG.GTMW_COLUMN_UNIT
            }
            else if(datasetRows > CONFIG.GTMW_ROW_UNIT && datasetColumns < CONFIG.GTMW_COLUMN_UNIT){
                log.info("Please make sure that the number of columns is greater than " + CONFIG.GTMW_COLUMN_UNIT);
                //TODO: datasetRows > CONFIG.GTMW_ROW_UNIT && datasetColumns < CONFIG.GTMW_COLUMN_UNIT
            }
            else { // datasetRows > CONFIG.GTMW_ROW_UNIT && datasetColumns > CONFIG.GTMW_COLUMN_UNIT
                boolean rowsFlag = true; // true means datasetRows % CONFIG.GTMW_ROW_UNIT == 0
                boolean columnsFlag = true; // true means datasetColumns % CONFIG.GTMW_COLUMN_UNIT == 0
                int rowsUnit = datasetRows / CONFIG.GTMW_ROW_UNIT;
                if(datasetRows % CONFIG.GTMW_ROW_UNIT != 0){
                    rowsUnit += 1;
                    rowsFlag = false;
                }
                int columnsUnit = datasetColumns / CONFIG.GTMW_COLUMN_UNIT;
                if(datasetColumns % CONFIG.GTMW_COLUMN_UNIT != 0){
                    columnsUnit += 1;
                    columnsFlag = false;
                }

                log.info("The dataset has " + rowsUnit + " rowsUnit and " + columnsUnit + " columnUnits");

                if(rowsFlag && columnsFlag){
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int dataUnitCounter = 0;
                    for (int i = 0 ; i < rowsUnit; i++){

                        String[][] dayData = new String[CONFIG.GTMW_ROW_UNIT][CONFIG.GTMW_COLUMN_UNIT];
                        String[] RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, (i+1)*CONFIG.GTMW_ROW_UNIT);

                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + (dataUnitCounter++));

                            String[] ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, (j+1)*CONFIG.GTMW_COLUMN_UNIT);
                            // get dayData
                            for (int x = i * CONFIG.GTMW_ROW_UNIT; x < (i + 1) * CONFIG.GTMW_ROW_UNIT; x++){
                                // get each row
                                String[] rowTemp = dataList.get(x + 1).split(",");
                                String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, (j+1)*CONFIG.GTMW_COLUMN_UNIT + 1);
                                dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                            }

                            dayUnit.put("RowAPPs", RowAPPs);
                            dayUnit.put("ColumnURLs", ColumnURLs);
                            dayUnit.put("dayData", dayData);

                            allDataUnits.add(dayUnit);
                        }
                    }
                }
                else if (rowsFlag && !columnsFlag){
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int columnLeft = datasetColumns % CONFIG.GTMW_COLUMN_UNIT;
                    int dataUnitCounter = 0;
                    log.info("The dataset has " + columnLeft + " columns left");
                    for (int i = 0 ; i < rowsUnit; i++){
                        String[][] dayData;
                        String[] RowAPPs;
                        String[] ColumnURLs;
                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter++));
                            if(j == columnsUnit - 1){
                                log.info("The last column unit");
                                dayData = new String[CONFIG.GTMW_ROW_UNIT][columnLeft];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, (i + 1)*CONFIG.GTMW_ROW_UNIT);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, j*CONFIG.GTMW_COLUMN_UNIT + columnLeft);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < (i + 1) * CONFIG.GTMW_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, j*CONFIG.GTMW_COLUMN_UNIT + columnLeft + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else {
                                log.info("Full unit...");
                                dayData = new String[CONFIG.GTMW_ROW_UNIT][CONFIG.GTMW_COLUMN_UNIT];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, (i+1)*CONFIG.GTMW_ROW_UNIT);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, (j+1)*CONFIG.GTMW_COLUMN_UNIT);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < (i + 1) * CONFIG.GTMW_ROW_UNIT; x++){
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, (j+1)*CONFIG.GTMW_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);

                                allDataUnits.add(dayUnit);
                            }
                        }
                    }
                }
                else if (!rowsFlag && columnsFlag){
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int rowsLeft = datasetRows % CONFIG.GTMW_ROW_UNIT;
                    int dataUnitCounter = 0;
                    log.info("The dataset has " + rowsLeft + " rows left");
                    for (int i = 0 ; i < rowsUnit; i++){
                        String[][] dayData;
                        String[] RowAPPs;
                        String[] ColumnURLs;
                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter++));
                            if(i == rowsUnit - 1){
                                log.info("The last row unit");
                                dayData = new String[rowsLeft][CONFIG.GTMW_COLUMN_UNIT];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, i*CONFIG.GTMW_ROW_UNIT + rowsLeft);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, (j+1)*CONFIG.GTMW_COLUMN_UNIT);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < i * CONFIG.GTMW_ROW_UNIT + rowsLeft; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, (j+1)*CONFIG.GTMW_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }else {
                                log.info("Full unit...");
                                dayData = new String[CONFIG.GTMW_ROW_UNIT][CONFIG.GTMW_COLUMN_UNIT];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, (i+1)*CONFIG.GTMW_ROW_UNIT);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, (j+1)*CONFIG.GTMW_COLUMN_UNIT);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < (i + 1) * CONFIG.GTMW_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, (j+1)*CONFIG.GTMW_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                        }
                    }
                }
                else { // rowsFlag == false && columnsFlag == false
                    log.info("rowsFlag: " + rowsFlag + ", columnsFlag: " + columnsFlag);
                    int rowsLeft = datasetRows % CONFIG.GTMW_ROW_UNIT;
                    int columnLeft = datasetColumns % CONFIG.GTMW_COLUMN_UNIT;
                    int dataUnitCounter = 0;
                    log.info("The dataset has " + rowsLeft + " rows and " + columnLeft + " columns left");
                    for (int i = 0 ; i < rowsUnit; i++){
                        String[][] dayData;
                        String[] RowAPPs;
                        String[] ColumnURLs;
                        for (int j = 0; j < columnsUnit; j++){
                            JSONObject dayUnit = new JSONObject();
                            dayUnit.put("daypoint", dayTime + "-" + Integer.toString(dataUnitCounter++));
                            if(i == (rowsUnit - 1) && j == (columnsUnit - 1)){
                                // if the last square
                                log.info("Start the last square");
                                dayData = new String[rowsLeft][columnLeft];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, i*CONFIG.GTMW_ROW_UNIT + rowsLeft);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, j*CONFIG.GTMW_COLUMN_UNIT + columnLeft);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < i * CONFIG.GTMW_ROW_UNIT + rowsLeft; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, j*CONFIG.GTMW_COLUMN_UNIT + columnLeft + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else if(i != (rowsUnit - 1) && j == (columnsUnit - 1)){
                                log.info("The last column unit");
                                dayData = new String[CONFIG.GTMW_ROW_UNIT][columnLeft];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, (i + 1)*CONFIG.GTMW_ROW_UNIT);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, j*CONFIG.GTMW_COLUMN_UNIT + columnLeft);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < (i + 1) * CONFIG.GTMW_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, j*CONFIG.GTMW_COLUMN_UNIT + columnLeft + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else if(i == (rowsUnit - 1) && j != (columnsUnit - 1)){
                                // if the last rowUnit that has insufficient number of rows
                                log.info("The last row unit");
                                dayData = new String[rowsLeft][CONFIG.GTMW_COLUMN_UNIT];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, i*CONFIG.GTMW_ROW_UNIT + rowsLeft);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, (j+1)*CONFIG.GTMW_COLUMN_UNIT);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < i * CONFIG.GTMW_ROW_UNIT + rowsLeft; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, (j+1)*CONFIG.GTMW_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
                                dayUnit.put("dayData", dayData);
                                allDataUnits.add(dayUnit);
                            }
                            else {
                                log.info("Full square...");
                                dayData = new String[CONFIG.GTMW_ROW_UNIT][CONFIG.GTMW_COLUMN_UNIT];
                                RowAPPs = Arrays.copyOfRange(allRowAPPs, i*CONFIG.GTMW_ROW_UNIT, (i+1)*CONFIG.GTMW_ROW_UNIT);
                                ColumnURLs = Arrays.copyOfRange(allColumnURLs, j*CONFIG.GTMW_COLUMN_UNIT, (j+1)*CONFIG.GTMW_COLUMN_UNIT);
                                for (int x = i * CONFIG.GTMW_ROW_UNIT; x < (i + 1) * CONFIG.GTMW_ROW_UNIT; x++){
                                    // get each row
                                    String[] rowTemp = dataList.get(x + 1).split(",");
                                    String[] columnTemp = Arrays.copyOfRange(rowTemp, j * CONFIG.GTMW_COLUMN_UNIT + 1, (j+1)*CONFIG.GTMW_COLUMN_UNIT + 1);
                                    dayData[x - (i * CONFIG.GTMW_ROW_UNIT)] = columnTemp;
                                }
                                dayUnit.put("RowAPPs", RowAPPs);
                                dayUnit.put("ColumnURLs", ColumnURLs);
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
