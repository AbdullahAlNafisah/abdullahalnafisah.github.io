let commonHeader = `
<style>
  nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  nav li {
    display: inline;
    margin: 0 10px;
    font-size: 1.5em;
  }
</style>

<nav>
  <ul>
    <li><a href="/index.html">Home</a></li>
    <li><a href="/archive.html">Archive</a></li>
  </ul>
</nav>
`;
document.getElementById("common-header").innerHTML = commonHeader;
