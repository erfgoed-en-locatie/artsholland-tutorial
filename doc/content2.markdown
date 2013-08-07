The following query selects eight venues in ??city ordered by the amount of distinct productions that take place in the coming two weeks.

Arts Holland contains strings in English and Dutch. When you want to filter only one of those two languages, the  [`langMatches` filter](http://www.w3.org/TR/sparql11-query/#func-langMatches) can be used. If you would execute this query without the this filter, duplicate results would be returned for each venue with a multilangual title. 

This query uses [subqueries](http://www.w3.org/TR/sparql11-query/#subqueries) to make sure that first all different productions are selected per venue, and only then are grouped, counted and ordered by number of distinct productions.