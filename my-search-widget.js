let i = 0;

(function ($) {
  let defaults = { type: "wikipedia", limit: 10 };

  let methods = {
    generateBlock: function (i, options) {
      let mainDiv = document.createElement("div");
      mainDiv.classList.add(`msw${i}`)
      $("body").append(mainDiv);
      let input = document.createElement("input");
      input.classList.add("msw-search");
      input.type = "text";
      let button = document.createElement("button");
      button.textContent = "Search";
      button.classList.add("msw-button");
      let div = document.createElement("div");
      div.classList.add("msw-results");
      let h2 = document.createElement("h2");
      if (options.type === "wikipedia") {
        h2.textContent = "Wikipedia search";
      } else if (options.type === "google-books") {
        h2.textContent = "Google Books search";
      }
      mainDiv.append(h2, input, button, div);
    },
    urlWikipedia: function (params, options) {
      let baseUrl =
        "https://en.wikipedia.org/w/api.php?action=query&format=json&list=search";
      let limitUrl = "&srlimit=" + options.limit;
      let searchUrl = "&srsearch=" + params;
      var url = baseUrl + limitUrl + searchUrl;
      return url;
    },
    urlGoogle: function (params, options) {
      let baseUrl = "https://www.googleapis.com/books/v1/volumes";
      let limitUrl = "?maxResults=" + options.limit;
      let searchUrl = "&q=" + params;
      var url = baseUrl + limitUrl + searchUrl;
      return url;
    },
    getData: function (index, options) {
      let pattern = $(`.msw${index} .msw-search`).val();
      let url = "";
      if (options.type === "wikipedia") {
        url = methods.urlWikipedia(pattern, options);
      } else if (options.type === "google-books") {
        url = methods.urlGoogle(pattern, options);
      }
      let promise = new Promise(function (resolve, reject) {
        $.ajax({
          type: "GET",
          url: url,
          dataType: "jsonp",
          success: function (data) {
            resolve(data);
          },
          error: function (errorMessage) {
            rejected(errorMessage);
          },
        });
      });
      return promise;
    },
    displayData(promise, index, options) {
      promise.then(
        (result) => {
          let ol = document.createElement("ol");
          ol.classList.add("msw-list");
          $(`.msw${index} .msw-results`).append(ol);
          if (options.type === "wikipedia") {
            $.each(result.query.search, function (key, value) {
              let li = document.createElement("li");
              li.classList.add("msw-element");
              ol.append(li);
              let a = document.createElement("a");
              a.target = "_blank";
              a.href = `https://en.wikipedia.org/wiki/${value.title}`;
              a.classList.add("msw-link");
              a.textContent = value.title;
              li.append(a)
            });
          } else if (options.type === "google-books") {
            $.each(result.items, function (key, value) {
              let li = document.createElement("li");
              li.classList.add("msw-element");
              ol.append(li);
              let a = document.createElement("a");
              a.target = "_blank";
              a.href = value.volumeInfo.previewLink;
              a.classList.add("msw-link");
              a.textContent = value.volumeInfo.title;
              li.append(a)
            });
          }
          $(".msw-link").on('click', (e) => {
            if(e.currentTarget.childNodes.length === 1) {
              let span = document.createElement("span");
              span.textContent = "[READ] ";
              e.currentTarget.prepend(span);
              e.currentTarget.style.color = "mediumseagreen";
            }
          })
        },
        (error) => console.log("Rejected: " + error.message)
      );
    }
  };

  $.fn.mySearchWidget = function (params) {
    if(!(params.limit <= 30 && params.limit>=1)){
      params.limit = defaults.limit;
    }
    if(!(params.type === "wikipedia" || params.type === "google-books")){
      params.type = defaults.type;
    }
    let options = $.extend({}, defaults, params);
    let index = i;
    i++;
    methods.generateBlock(index, options);
    $(".msw-button").on('click', function () {
      $(`.msw${index} .msw-results`).empty();
      methods.displayData(methods.getData(index, options), index, options);
    });
    $(".msw-search").on("keyup", function (e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        $(`.msw${index} .msw-results`).empty();
        methods.displayData(methods.getData(index, options), index, options);
      }
    });
  };
})(jQuery);


