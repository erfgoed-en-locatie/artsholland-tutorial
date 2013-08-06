In ??city zijn 'n hoop evenementlocaties. De belangrijkste vind je zo:

Arts Holland - and many other triple stores - contains multilangual data.

- langMatches

If you would execute this query without the `langMatches` filter, the triple store would return duplicate results for each venue with a multilangual title. 

`?venue dc:title ?venue_title` triple would match twice: once against the Dutch title and once against the English one.

http://www.w3.org/TR/sparql11-query/#func-langMatches

- Subquery
http://www.w3.org/TR/sparql11-query/#subqueries