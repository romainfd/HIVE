import java.util.Iterator;
import java.util.Vector;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

public class Acronym {
  // Access to datastore
  private static final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private final static String ENTITY_SYNONYM = "Synonym";
  private final static String A1 = "acronym1";
  private final static String A2 = "acronym2";
  private final static String ACRONYM = "acronym";
  private final static String MEANING = "meaning";
  private final static String DESC = "description";
  // Parameters
  private String acronym;
  private String meaning;
  private String description;
  private String[] synonyms;

  public static boolean checkAcronym(String acronym) {
    return acronym.matches("[a-zA-Z]{2,7}");
  }

  public Acronym(String acronym, String meaning, String description) {
    this.acronym = acronym;
    this.meaning = meaning;
    this.description = description;
    this.synonyms = getSynonyms(this.acronym);
  }

  public Acronym(Entity entity) {
    this.acronym = (String)entity.getProperty(ACRONYM);
    this.meaning = (String)entity.getProperty(MEANING);
    this.description = (String)entity.getProperty(DESC);
    this.synonyms = getSynonyms(this.acronym);
  }

  public static String[] getSynonyms(String acronym) {
    Vector<String> synonym_vector = new Vector<>();
    // right search
    Query.Filter propertyFilter = new Query.FilterPredicate(A1, Query.FilterOperator.EQUAL, acronym);
    Query q = new Query(ENTITY_SYNONYM).setFilter(propertyFilter);
    PreparedQuery pq = datastore.prepare(q);
    Iterator<Entity> results = pq.asIterable().iterator();
    while (results.hasNext()) {
      Entity entry = results.next();
      synonym_vector.add((String)entry.getProperty(A2));
    }
    // left search
    propertyFilter = new Query.FilterPredicate(A2, Query.FilterOperator.EQUAL, acronym);
    q = new Query(ENTITY_SYNONYM).setFilter(propertyFilter);
    pq = datastore.prepare(q);
    results = pq.asIterable().iterator();
    while (results.hasNext()) {
      Entity entry = results.next();
      synonym_vector.add((String)entry.getProperty(A1));
    }
    return synonym_vector.toArray(new String[synonym_vector.size()]);
  }

  public String getName() {
    return acronym;
  }

  public static void main(String[] args) {
    System.out.println("Hello");
  }
}
