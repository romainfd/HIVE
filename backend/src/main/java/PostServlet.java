import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.StringReader;
import java.util.Arrays;
import java.util.List;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.opencsv.CSVReader;

public class PostServlet extends HttpServlet {

  private final static String ENTITY_SYNONYM = "Synonym";
  private final static String A1 = "acronym1";
  private final static String A2 = "acronym2";
  private final static String ENTITY_ACRONYM = "Acronym";
  private final static String ACRONYM = "acronym";
  private final static String MEANING = "meaning";
  private final static String DESC = "description";
  private final static String SYN = "synonyms";


  private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {

    resp.addHeader("Access-Control-Allow-Origin", "*");
    resp.addHeader("Access-Control-Allow-Methods","GET, OPTIONS, HEAD, PUT, POST");

    String action = req.getRequestURI().split("/")[1];
    if(action.equals("acronym")) {
      String acronym = req.getParameter("acronym");
      String meaning = "";
      String description = "";
      String synonyms = "";

      if (acronym == null)
        acronym = "";
      else {
        Entity entity = GetServlet.get(acronym);
        if (entity != null) {
          meaning = (String)entity.getProperty(MEANING);
          description = (String)entity.getProperty(DESC);
          synonyms = String.join(", ", Acronym.getSynonyms(acronym));
        }
      }

      req.setAttribute(ACRONYM, acronym);
      req.setAttribute(MEANING, meaning);
      req.setAttribute(DESC, description);
      req.setAttribute(SYN, synonyms);
      req.getRequestDispatcher("/jsp/acronym.jsp").forward(req, resp);
    }
    else if(action.equals("csv")){
      req.getRequestDispatcher("/jsp/csv.jsp").forward(req, resp);
    }
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

    resp.addHeader("Access-Control-Allow-Origin", "*");
    resp.addHeader("Access-Control-Allow-Methods","GET, OPTIONS, HEAD, PUT, POST");

    String action = req.getRequestURI().split("/")[1];
    if(action.equals("acronym")){
      String acronym = req.getParameter("acronym");
      String meaning = req.getParameter("meaning");
      String description = req.getParameter("description");
      String synonyms = req.getParameter("synonyms");

      if(synonyms != null){
        String[] synonym_list = synonyms.replace(" ", "").split(",");
        for (String synonym : synonym_list) {
          postSynonym(acronym, synonym);
        }
      }

      if(Acronym.checkAcronym(acronym)){
        postAcronym(acronym, meaning, description);
        req.getRequestDispatcher("/jsp/success.jsp").forward(req, resp);
      }
      else{
        req.getRequestDispatcher("/jsp/error.jsp").forward(req, resp);
      }
    }
    else if(action.equals("csv")){
      try {
        int posted = postCSV(req.getParameter("glossary"));
        req.setAttribute("posted", posted);
        req.getRequestDispatcher("/jsp/successCSV.jsp").forward(req, resp);
      } catch(Exception e) {
        req.getRequestDispatcher("/jsp/errorCSV.jsp").forward(req, resp);
      }
    }
  }

  public static void postAcronym(String acronym, String meaning, String description) {
    Entity entity = new Entity(ENTITY_ACRONYM, acronym);
    entity.setProperty(ACRONYM, acronym);
    entity.setProperty(MEANING, meaning);
    entity.setProperty(DESC, description);
    datastore.put(entity);
  }

  public static int postCSV(String glossary){
    int posted = 0;
    try (CSVReader csvReader = new CSVReader(new StringReader(glossary))) {
      String[] values;
      while ((values = csvReader.readNext()) != null) {
        List<String> line = Arrays.asList(values);
        String acronym = line.get(0);
        String meaning = line.get(1);
        String description = line.get(2);
        String[] synonyms = line.get(3).replace(" ", "").split(",");;
        if(Acronym.checkAcronym(acronym)){
          postAcronym(acronym, meaning, description);
          posted++;
          for (String synonym : synonyms) {
            postSynonym(acronym, synonym);
          }
        }
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return posted;
  }

  public static void postSynonym(String acronym1, String acronym2) {
    if(acronym2.compareTo(acronym1) < 0)
      postSynonym(acronym2, acronym1);
    else {
      String id = acronym1 + "_" + acronym2;
      Entity entity = new Entity(ENTITY_SYNONYM, id);
      entity.setProperty(A1, acronym1);
      entity.setProperty(A2, acronym2);
      datastore.put(entity);
    }
  }
}
