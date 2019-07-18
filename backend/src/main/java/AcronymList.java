import java.util.HashMap;
import java.util.Vector;

import com.google.appengine.api.datastore.Entity;

class AcronymList {

  private boolean success = true;
  private HashMap<String, Acronym> acronyms;
  private Vector<String> acronym_list;

  public AcronymList(Entity[] entity_list) {
    this.acronyms = new HashMap<>();
    Acronym acronym;
    for (Entity anEntity_list : entity_list) {
      acronym = new Acronym(anEntity_list);
      acronyms.put(acronym.getName(), acronym);
    }
  }

  public AcronymList(Vector<String> acronym_list) {
    this.acronym_list = acronym_list;
  }
}
