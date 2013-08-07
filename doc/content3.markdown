This query selects a list of ten distinct productions, ordered by the first time they occur in the ??venue_title in ??city.

The [`OPTIONAL` keyword](http://www.w3.org/TR/sparql11-query/#optionals) can be used to loosen the selection of certain triples. In this example, also productions without a homepage are returned; the triple which selects the website of a production is optional.
