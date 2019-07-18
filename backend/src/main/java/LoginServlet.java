import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class LoginServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    req.getSession().setAttribute("loginDestination", "/");
    if(checkAccess(req, resp)) {
      String destination = (String) req.getSession().getAttribute("loginDestination");
      if (destination == null) {
        destination = "/";
      }
      resp.sendRedirect(destination);
    }
  }

  private static boolean isAuthorized(String email) { return email.split("@")[1].equals("liveramp.com"); }

  static boolean checkAccess(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    if (userService.isUserLoggedIn()) {
      User user = userService.getCurrentUser();
      if (isAuthorized(user.getEmail())) {
        return true;
      } else {
        resp.sendRedirect("/wrongAccount");
      }
    }
    else {
      resp.sendRedirect(userService.createLoginURL("/login"));
    }
    return false;
  }
}