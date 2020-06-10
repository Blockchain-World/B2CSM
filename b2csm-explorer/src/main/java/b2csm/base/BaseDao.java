package b2csm.base;

/**
 * Database Operation base class
 */

public interface BaseDao {
    /**
     * add object
     * @param object
     */
    int insert(Object object);

    /**
     * delete object based on id
     * @param id
     */
    int delByID(String id);

    /**
     * modify object based on id
     * @param object
     */
    int update(Object object);

    /**
     * id corresponds to a table
     * @param id
     * @return object
     */
    <T> T getByID(Integer id);

}
