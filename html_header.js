let commonHeader = `
<header class="header" style="padding: 20px; background-color:#f9f9f9; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
<nav class="nav" style="text-align: center; margin-top: 20px;">
    <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="display: inline; margin: 0 10px;"><a href="/index.html">Home</a></li>
        <li style="display: inline; margin: 0 10px;"><a href="/projects/faster-than-nyquist/faster-than-nyquist.html">FTN</a></li>
        <li style="display: inline; margin: 0 10px;"><a href="/publications.html">Publications</a></li>
        <li style="display: inline; margin: 0 10px;"><a href="/archive.html">Archive</a></li>
    </ul>
</nav>
</header>
`;
document.getElementById("common-header").innerHTML = commonHeader;