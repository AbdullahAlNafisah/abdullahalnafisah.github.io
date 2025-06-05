---
layout: default
title: Blog
---

## Blog

Welcome to my blog! I write about things I learn, technical deep dives, research, and occasional thoughts.

Here are my latest posts:

<ul>
  {% for post in site.posts %}
    <li><a href="{{ post.url }}">{{ post.title }}</a> <small>({{ post.date | date: "%B %d, %Y" }})</small></li>
  {% endfor %}
</ul>
