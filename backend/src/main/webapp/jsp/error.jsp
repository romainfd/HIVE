<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<!doctype html>
<html>
<head>
  <title>HoverIV</title>
  <link rel="stylesheet" type="text/css" href="/style.css">
</head>
<body bgcolor="#f5f6fa">
<center>
  <img src="logo.png" , align="bottom">
  <p id=title>HoverIV</p>
  <form action="/acronym" method="GET">
    <div style="font-size: 14pt">Error :(</div>
    <div>Acronyms must contain 2 to 6 capital characters.</div>
    <div class="button">
      <button type="submit">Back</button>
    </div>
  </form>
</center>
</body>
</html>