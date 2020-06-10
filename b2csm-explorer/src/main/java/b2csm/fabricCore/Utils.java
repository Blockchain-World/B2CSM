package b2csm.fabricCore;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Utils {

    /**
     * @param date
     */
    static String parseDateFormat(Date date){
        try{
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US);
            return sdf.format(date);
        }catch (Exception ex){
            return "";
        }
    }

}
