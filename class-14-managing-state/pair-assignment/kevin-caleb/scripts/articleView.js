(function(module) {

  var articleView = {};

  var render = function(article) {
    var template = Handlebars.compile($('#article-template').text());

    article.daysAgo = parseInt((new Date() - new Date(article.publishedOn))/60/60/24/1000);
    article.publishStatus = article.publishedOn ? 'published ' + article.daysAgo + ' days ago' : '(draft)';
    article.body = marked(article.body);

    return template(article);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  /*
  This function runs the Handlebars compiler on the proto-HTML in the option template script. This popluates 2 options menus, 1 with authors and 1 with categories.

  template is a variable that stores the compiled HTML data from Handlebars (though placeholders have not yet been filled in).

  options is a variable that returns the compiled HTML for the authors options menu, with the author data filled in. The allAuthors method is used to map a list of unique author names with are passed to the template compiler. A jQuery append method is then used to append the authors to the options menu in the dom.

  The allCategories method accomplishes the same thing, but populates the template with data pulled directly from the SQL database. (returns the data by calling 'template', maps the data, and appends it to the DOM)

  For all we can tell, the if statement intended to filter out duplicates is unnecessary, since the allAuthors and allCategories methods already use reduce methods to remove duplicates. This appears to be a piece of redundant code.

  populateFilters is called by articleView.index which is called by articlesController.index which is called in routes.js when a browser loads the specified URI.

  */
  articleView.populateFilters = function() {
    var options,
      template = Handlebars.compile($('#option-template').text());

    // Example of using model method with FP, synchronous approach:
    // NB: This method is dependant on info being in the DOM. Only authors of shown articles are loaded.
    options = Article.allAuthors().map(function(author) { return template({val: author}); });
    console.log(options);
    if ($('#author-filter option').length < 2) { // Prevent duplication
      $('#author-filter').append(options);
    };

    // Example of using model method with async, SQL-based approach:
    // This approach is DOM-independent, since it reads from the DB directly.
    Article.allCategories(function(rows) {
      if ($('#category-filter option').length < 2) {
        $('#category-filter').append(
          rows.map(function(row) {
            return template({val: row.category});
          })
        );
      };
      // ouch... http://callbackhell.com
    });
  };

  // COMMENT: What does this method do?  What is it's execution path?
  /*
  This function handles changes to selections in the options menu, such as when a user selects an author or category.
  It sets the author or category that the user selected as the one shown in the default options view.
  It constructs a URI path that substitues "author" or "category", and ends with the selected value, with any whitespace replaced by "+" symbols.
  The resulting URI will trigger any associated functions in the routes.js file to handle the updates to the DOM. (e.g. if "resource" gets replaced with author, articlesController.loadByAuthor will be triggered by page js.)

  */
  articleView.handleFilters = function() {
    $('#filters').one('change', 'select', function() {
      resource = this.id.replace('-filter', '');
      page('/' + resource + '/' + $(this).val().replace(/\W+/g, '+')); // Replace any/all whitespace with a +
    });
  };
  // articleView.handleAuthorFilter = function() {
  //   $('#author-filter').on('change', function() {
  //     if ($(this).val()) {
  //       $('article').hide();
  //       $('article[data-author="' + $(this).val() + '"]').fadeIn();
  //     } else {
  //       $('article').fadeIn();
  //       $('article.template').hide();
  //     }
  //     $('#category-filter').val('');
  //   });
  // };
  //
  // articleView.handleCategoryFilter = function() {
  //   $('#category-filter').on('change', function() {
  //     if ($(this).val()) {
  //       $('article').hide();
  //       $('article[data-category="' + $(this).val() + '"]').fadeIn();
  //     } else {
  //       $('article').fadeIn();
  //       $('article.template').hide();
  //     }
  //     $('#author-filter').val('');
  //   });
  // };

  // DONE: Remove the setTeasers method, and replace with a plain ole link in the article template.
  // articleView.setTeasers = function() {
  //   $('.article-body *:nth-of-type(n+2)').hide();
  //
  //   $('#articles').on('click', 'a.read-on', function(e) {
  //     e.preventDefault();
  //     $(this).parent().find('*').fadeIn();
  //     $(this).hide();
  //   });
  // };

  articleView.initNewArticlePage = function() {
    $('#articles').show().siblings().hide();

    $('#export-field').hide();
    $('#article-json').on('focus', function(){
      this.select();
    });

    $('#new-form').on('change', 'input, textarea', articleView.create);
  };

  articleView.create = function() {
    var article;
    $('#articles').empty();

    // Instantiate an article based on what's in the form fields:
    article = new Article({
      title: $('#article-title').val(),
      author: $('#article-author').val(),
      authorUrl: $('#article-author-url').val(),
      category: $('#article-category').val(),
      body: $('#article-body').val(),
      publishedOn: $('#article-published:checked').length ? util.today() : null
    });

    $('#articles').append(render(article));

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

    // Export the new article as JSON, so it's ready to copy/paste into blogArticles.js:
    $('#export-field').show();
    $('#article-json').val(JSON.stringify(article) + ',');
  };

  // COMMENT: What does this method do?  What is it's execution path?

  /*
  The purpose of this function is to handle requests routed through routes.js to load any version of the articles page (filtered or unfiltered). Any such request will trigger a method on articlesController that uses articleView.index to return the data in the required scope, and then --via next() back in routes.js-- loads that data in the DOM.

  The narrower purpose of this function is to show the "articles" section in the DOM and hide its siblings (in this case, the "about" section). Then it appends the data in whatever scope it receives it in.

  It also serves to "reset" the page each time the user browses to a new view.
  */

  articleView.index = function(articles) {
    $('#articles').show().siblings().hide();

    $('#articles article').remove();
    articles.forEach(function(a) {
      $('#articles').append(render(a));
    });

    articleView.populateFilters();
    // COMMENT: What does this method do?  What is it's execution path?
    /*
    These are simply calling the functions to reset the options menu each time the user navigates to a new view of the site. For how they function, see comments above where these functions were created.
    articleView.handleFilters();
    */
    // DONE: Replace setTeasers with just the truncation logic, if needed:
    if ($('#articles article').length > 1) {
      $('.article-body *:nth-of-type(n+2)').hide();
    }
  };

  articleView.initAdminPage = function() {
    var template = Handlebars.compile($('#author-template').text());

    Article.numWordsByAuthor().forEach(function(stat) {
      $('.author-stats').append(template(stat));
    });

    $('#blog-stats .articles').text(Article.all.length);
    $('#blog-stats .words').text(Article.numWordsAll());
  };

  module.articleView = articleView;
})(window);
