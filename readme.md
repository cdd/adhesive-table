# adhesiveTable

> A modern jQuery approach to building sticky headers and columns for html tables, based on [Fixed-Header-Table](https://github.com/markmalek/Fixed-Header-Table) by Mark Malek. Unlike many other plugins in the world of tables, this one provides only one piece of functionality: it glues headers to the top, and columns to the side. 


## Getting Started

In the following example we assume that you have a [properly formatted table](http://www.the-art-of-web.com/html/table-markup/), with selector ``` #tableExample```. First wrap your table in container div. Then download the javascript and css files, and include them in your page. In a seperate css file, declare the limits of the height and width of your soon to be sticky table and its container:

```css
#tableContainer {
  height: 300px;
  width: 300px;
}
#tableExample {
  height: 300px;
  width: 250px;
}
```

you dont have set overflow or anything fancy like that, we got it. In your web page:

```html
<head>
    <link rel="stylesheet" href="src/adhesiveTable.css" media="screen">
    <link rel="stylesheet" href="yourOtherCssFile.css" media="screen">
</head>
....
<div id="tableContainer">
  <table id='tableExample'>
    <thead>...</thead>
    <tbody>...</tbody>
  </table>
</div>
....
<script src="jquery.js"></script>
<script src="src/fixedheaderrewrite.min.js"></script>
<script>
    jQuery('#tableExample').adhesiveTable(); 
</script>
```

The resulting table should have a sticky header, but what if you want to have a sticky column too? Well just change your adhesiveTable call to be:

```html
<script>
    jQuery('#tableExample').adhesiveTable(true); 
</script>
```

and all should be properly stuck. If you are having problems, I recommend referring to the specs for specific examples. 

## Specific Commands

The interface in adhesiveTable is really simple, if you want just a sticky header you call either

```html
<script>
    jQuery('#tableExample').adhesiveTable(); 
</script>
```

OR

```html
<script>
    jQuery('#tableExample').adhesiveTable(false); 
</script>
```

If you want a sticky column too, you simply call:

```html
<script>
    jQuery('#tableExample').adhesiveTable(true); 
</script>
```
Finally, if for some reason you need to remove the formatting from your table, call:
```html
<script>
    jQuery('#tableExample').adhesiveTable('destroy'); 
</script>
```

Thats it.


## License

MIT 
