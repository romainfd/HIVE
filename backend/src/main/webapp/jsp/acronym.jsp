<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<html>
<head>
    <title>HoverIV - Post an Acronym</title>
    <link rel="stylesheet" type="text/css" href="/style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="/autocompleteAcronym.js"></script>
    <script>
        $(document).on('keypress',function(e) {
            if(e.which == 13) {
                if(document.activeElement.id != "description")
                    $('button#submit').click();
            }
        });
    </script>
    <style>
        .autocomplete-items{
            background: white;
            width: 300px;
            position: relative;
            top: 81px;
            left: 47.5px;
            padding-top: 1px;
            padding-bottom: 1px;
            text-align: left;
        }
    </style>
</head>
<body bgcolor="#f5f6fa">
<center>
    <a href="https://liveramp-eng-hackweek.appspot.com">
        <img src="logo.png" , align="bottom">
    </a>
    <p id=title>HoverIV</p>
    <form action="/acronym" method="POST" autocomplete="off">
        <div style="font-size: 14pt">Post an acronym</div>
        <div class="autocomplete">
            <label for="acronym">Acronym</label>
            <input type="text" id="acronym" name="acronym" placeholder="2 to 6 capital letters..." style="font-weight: bold" value="${acronym}">
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
            <input type="text" id="synonyms" name="synonyms" placeholder="Synonyms separated by commas..." value="${synonyms}">
        </div>
        <div>
            <a href="https://liveramp-eng-hackweek.appspot.com"><button type="button">Back</button></a>
            <button type="submit" id="submit">Submit</button>
        </div>
    </form>
</center>
</body>
</html>