<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<html>
<head>
  <title>HoverIV - Post an Acronym</title>
  <link rel="stylesheet" type="text/css" href="/style.css">
</head>
<body bgcolor="#f5f6fa">
<center>
  <img src="/logo.png" , align="bottom">
  <p id=title>HoverIV</p>
  <form action="/acronym" method="POST">
    <div style="font-size: 14pt">Success. Thanks for supporting the project!</div>
    <div>
      <label for="acronym">Acronym</label>
      <input type=atext" id="acronym" name="acronym" placeholder="2 to 6 capital letters..." value="${acronym}">
    </div>
    <div>
      <label for="meaning">Meaning</label>
      <input type="text" id="meaning" name="meaning" placeholder="Acronym in full..." value="${meaning}">
    </div>
    <div>
      <label for="description" style="padding-top: 4em">Description</label>
      <textarea id="description" name="description" placeholder="Acronym description...">${description}</textarea>
    </div>
    <div>
      <label for="synonyms">Synonyms</label>
      <input type="text" id="synonyms" name="synonyms" placeholder="Synonyms separated by a comma..." value="${synonyms}">
    </div>
    <div class="button">
      <button type="submit">Submit</button>
    </div>
  </form>
</center>
</body>
</html>