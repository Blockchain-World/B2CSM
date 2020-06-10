package b2csm.utility;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

public class FileOperation {
    public static void write(String path, String content){
        try{
            File file = new File(path);
            if(!file.exists()){
                file.createNewFile();
            }
            FileWriter fileWriter = new FileWriter(file.getAbsoluteFile(), true);
            BufferedWriter bw = new BufferedWriter(fileWriter);
            bw.write(content);
            bw.close();
            System.out.println("Finish writing");
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
