<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<!doctype html>
<html>
<head>
  <title>HIVE - Error</title>
  <link rel="stylesheet" type="text/css" href="/style.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script>
      $(document).on('keypress',function(e) {
          if(e.which == 13) {
              $('button#submit').click();
          }
      });
  </script>
</head>
<body bgcolor="#f5f6fa">
<center>
  <a href="https://liveramp-eng-hackweek.appspot.com">
    <img src="/logo.png" , align="bottom">
  </a>
  <p id=title>HIVE</p>
  <form action="/acronym" method="GET">
    <div style="font-size: 14pt">Error :(</div>
    <div>Acronyms must contain 2 to 6 capital characters.</div>
    <div class="button">
      <button type="submit" id="submit">Try again</button>
    </div>
  </form>
</center>
</body>
</html>