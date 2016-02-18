(function(module) {
  var articlesController = {};

  Article.createTable();  // Ensure the database table is properly initialized

  articlesController.index = function(ctx, next) {
    articleView.index(ctx.articles);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  /*
    This is a method on the articlesController object that accepts the context
    object and the next() method as parameters and is called when the page hits
    the /article/:id route, as defined in routes.js.
    This method calls the .findWhere method to run a SQL query and find the article
    with an id property that matches the id in the current context. loadById then
    creates a .articles property on the ctx object that contains the selected
    article object and executes the next() method to run the second callback
    function specified in the route to display the article information.
  */
  articlesController.loadById = function(ctx, next) {
    var articleData = function(article) {
      ctx.articles = article;
      next();
    };

    Article.findWhere('id', ctx.params.id, articleData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  /*
    This is a method on the articlesController object that accepts the context
    object and the next() method as parameters and is called when the page hits
    the /article/:authorName route, as defined in routes.js.
    This method calls the .findWhere method to run SQL query and return articles
    with an "author" property that matches the authorName parameter of the current
    context in the form of an array of objects.
    .loadByAuthor then sets ctx.articles equal to this array of objects and passes
    it back to the next callback function in the chain for rendering on the page.
  */
  articlesController.loadByAuthor = function(ctx, next) {
    var authorData = function(articlesByAuthor) {
      ctx.articles = articlesByAuthor;
      next();
    };

    Article.findWhere('author', ctx.params.authorName.replace('+', ' '), authorData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  /*
    This is a method on the articlesController object that accepts the context
    object and the next() method as parameters and is called when the page hits
    the /article/:categoryName route, as defined in routes.js.
    This method calls the .findWhere method to run a SQL query and return articles
    with a "category" property that matches the categoryName parameter of the
    current context in the form of an array of objects.
    .loadByAuthor then sets ctx.articles equal to this array of objects and passes
    it back to the next callback function in the chain for rendering the page.
  */
  articlesController.loadByCategory = function(ctx, next) {
    var categoryData = function(articlesInCategory) {
      ctx.articles = articlesInCategory;
      next();
    };

    Article.findWhere('category', ctx.params.categoryName, categoryData);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  /*
    This is a method on the articlesController object that accepts the context
    object and the next() method as parameters and is called when the page hits
    the root path ('/'). It checks to see if the Article.all array has data. If
    so, it sets ctx.articles equal to the full Article.all array. If the array is
    empty, it runs the .fetchAll method to run the JSON query and populate the
    Article.all array.
  */
  articlesController.loadAll = function(ctx, next) {
    var articleData = function(allArticles) {
      ctx.articles = Article.all;
      next();
    };

    if (Article.all.length) {
      ctx.articles = Article.all;
      next();
    } else {
      Article.fetchAll(articleData);
    }
  };


  module.articlesController = articlesController;
})(window);
