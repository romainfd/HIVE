import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;
import java.util.Iterator;
import java.util.Vector;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PropertyProjection;
import com.google.appengine.api.datastore.Query;

import com.google.gson.Gson;

public class GetServlet extends HttpServlet {

  private final static String ENTITY_ACRONYM = "Acronym";
  private final static String ACRONYM = "acronym";
  private final static String MEANING = "meaning";
  private final static String DESC = "description";
  private final static String SYN = "synonyms";

  private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private Gson gson = new Gson();

  public static Entity get(String acronym) {
    Key k = KeyFactory.createKey(ENTITY_ACRONYM, acronym);
    try {
      return datastore.get(k);
    } catch (EntityNotFoundException e) {
      return null;
    }
  }

  public static Entity[] get(String[] acronym_list) {
    Vector<Key> ks = new Vector<>();
    for (int i = 0; i < acronym_list.length; i++) {
      ks.add(KeyFactory.createKey(ENTITY_ACRONYM, acronym_list[i]));
    }
    Collection<Entity> result = datastore.get(ks).values();
    return result.toArray(new Entity[result.size()]);
  }

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    // authorize external access
    resp.addHeader("Access-Control-Allow-Origin", "*");
    resp.addHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST");

    AcronymList acronyms = null;
    String action = req.getRequestURI().split("/")[1];
    if(action.equals("get")) {
      String acronym = req.getParameter("acronym");
      String[] acronym_list = acronym.split(",");
      Entity[] entity_list = get(acronym_list);
      acronyms = new AcronymList(entity_list);
      // JSON
      String acronymJsonString = gson.toJson(acronyms);
      PrintWriter out = resp.getWriter();
      resp.setContentType("application/json");
      resp.setCharacterEncoding("UTF-8");
      out.print(acronymJsonString);
      out.flush();
    }
    else if(action.equals("getAll")){
      Query q = new Query(ENTITY_ACRONYM);
      q.addProjection(new PropertyProjection(ACRONYM, String.class));
      Iterator<Entity> results = datastore.prepare(q).asIterable().iterator();
      Vector<String> acronyms_vector = new Vector<>();
      while (results.hasNext())
        acronyms_vector.add((String) results.next().getProperty(ACRONYM));
      acronyms = new AcronymList(acronyms_vector);
      // JSON
      String acronymJsonString = gson.toJson(acronyms);
      PrintWriter out = resp.getWriter();
      resp.setContentType("application/json");
      resp.setCharacterEncoding("UTF-8");
      out.print(acronymJsonString);
      out.flush();
    }
    else if(action.equals("browse")) {
      String acronym = req.getParameter("acronym");
      if (acronym == null) {
        req.getRequestDispatcher("/index.html").forward(req, resp);
      } else {
        Entity entity = GetServlet.get(acronym);
        if (entity == null) {
          req.getRequestDispatcher("/jsp/notFound.jsp").forward(req, resp);
        } else {
          String meaning = (String)entity.getProperty(MEANING);
          String description = (String)entity.getProperty(DESC);
          String synonyms = String.join(", ", Acronym.getSynonyms(acronym));
          req.setAttribute(ACRONYM, acronym);
          req.setAttribute(MEANING, meaning);
          req.setAttribute(DESC, description);
          req.setAttribute(SYN, synonyms);
          req.getRequestDispatcher("/jsp/browse.jsp").forward(req, resp);
        }
      }
    }
  }
}
