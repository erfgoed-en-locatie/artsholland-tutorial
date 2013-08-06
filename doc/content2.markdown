The following query selects eight venues in ??city ordered by the amount of distinct productions that take place in the coming two weeks.

Arts Holland contains strings in English and Dutch. When you want to filter only one of those two languages, the  [`langMatches` filter](http://www.w3.org/TR/sparql11-query/#func-langMatches) can be used. If you would execute this query without the `langMatches` filter, duplicate results would be returned for each venue with a multilangual title. 

- Subquery
http://www.w3.org/TR/sparql11-query/#subqueries

a is shorthand for rdf:type