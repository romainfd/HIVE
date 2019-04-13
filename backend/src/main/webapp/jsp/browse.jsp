<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<html>
<head>
  <title>HIVE - Search acronyms</title>
  <link rel="stylesheet" type="text/css" href="/style.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script>
      $(document).on('keypress',function(e) {
          if(e.which == 13) {
              $('button#submit').click();
          }
      });
      $(document).ready(function() {
          if($('label#synonyms').text().length == 0)
              $('div#syn').remove();
          else
              $('label#synonyms').text(("Synonyms: " + $('label#synonyms').text()));
      });
  </script>
</head>
<body bgcolor="#f5f6fa">
<center>
  <a href="https://liveramp-eng-hackweek.appspot.com">
    <img src="/logo.png" , align="bottom">
  </a>
  <p id=title>HIVE</p>
  <form action="" method="GET">
    <div style="font-family: Flexo-Demi; font-size:14pt">${meaning}</div>
    <div>
      <p>${description}</p>
    </div>
    <div>
      <label id="synonyms" style="font-style: italic; text-align: center; width:300px;">${synonyms}</label>
    </div>
    <div>
      <button type="submit" id="submit">Back</button>
      <a href="https://liveramp-eng-hackweek.appspot.com/acronym?acronym=${acronym}"><button type="button">Edit</button></a>
    </div>
  </form>
</center>
</body>
</html>