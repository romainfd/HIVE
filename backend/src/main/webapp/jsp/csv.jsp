<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<html>
<head>
  <title>HoverIV - Post an Acronym</title>
  <style>
    @font-face {
      font-family: 'Flexo-Demi';
      font-style: normal;
      font-weight: normal;
      src: url('/fonts/flexo-demi.otf');
    }
    @font-face {
      font-family: 'Flexo-Thin';
      font-style: normal;
      font-weight: normal;
      src: url('/fonts/flexo-thin.otf');
    }

    #title {
      font-family: Flexo-Demi;
      font-size: 20pt;
    }

    p, div, input, button, textarea {
      font-family: Flexo-Thin;
      font-size: 11pt;
    }

    /*FORM STYLE*/

    form {
      margin: 0 auto;
      width: 400px;
      /* To see the outline of the form */
      padding: 1em;
      border: 1px solid #CCC;
      border-radius: 1em;
      background-color: #f8f8f8
    }

    form div + div {
      margin-top: 1em;
    }

    label {
      /* To make sure that all labels have the same size and are properly aligned */
      display: inline-block;
      width: 90px;
      text-align: right;
    }

    input, textarea {
      /* To give the same size to all text fields */
      width: 300px;
      box-sizing: border-box;

      /* To harmonize the look & feel of text field border */
      border: 1px solid #999;

      /*background: url(./media/underline.png);*/
      /*border-style: none;*/
      padding: 3px 7px 3px 7px;

    }

    input:focus, textarea:focus {
      /* To give a little highlight on active elements */
      border-color: #000;
    }

    textarea {
      /* To properly align multiline text fields with their labels */
      vertical-align: top;
      /* To give enough room to type some text */
      height: 20em;
    }

  </style>
</head>
<body bgcolor="#f5f6fa">
<center>
  <img src="/logo.png" , align="bottom">
  <p id=title>HoverIV</p>
  <form action="/csv" method="POST">
    <div style="font-size: 14pt">Post a csv of acronyms</div>
    <div>
      <textarea id="glossary" name="glossary" placeholder="Copy paste CSV in the format acronym,meaning,description"></textarea>
    </div>
    <div class="button">
      <button type="submit">Submit</button>
    </div>
  </form>
</center>
</body>
</html>