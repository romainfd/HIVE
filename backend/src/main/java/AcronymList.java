import java.util.HashMap;
import java.util.Vector;

import com.google.appengine.api.datastore.Entity;

public class AcronymList {

  private boolean success = true;
  private HashMap<String, Acronym> acronyms;
  private Vector<String> acronym_list;

  public AcronymList(Entity[] entity_list) {
    this.acronyms = new HashMap<>();
    Acronym acronym;
    for (int i = 0; i < entity_list.length; i++) {
      acronym = new Acronym(entity_list[i]);
      acronyms.put(acronym.getName(), acronym);
    }
  }

  public AcronymList(Vector<String> acronym_list) {
    this.acronym_list = acronym_list;
  }
}
