require(['explaingit'], function (explainGit) {

  $( document ).ready(function() {

    // miscelleanous inits ---------------------->
    $('#home').off('click').on('click', function(event) {
      event.preventDefault();
      resetAndOpen();
    });

    $('#download').off('click').on('click', function(event) {
      event.preventDefault();
      alert("not yet");
    });

    $('#workflowDropdown').dropdown();

    var workflows = {};

    if (_WORKFLOWS_.length == 0) {
      $('.dropdown').html("no workflow defined");
    }

    _WORKFLOWS_.map(function(tuple) {
      workflows[tuple[0]]=tuple[1];
      $( '#' + tuple[0] ).off('click').on('click', function() {
        resetAndOpen(this.id);
      });
    });
    // </---------------------- miscelleanous inits

    //////////////////////////////////////////////////////////////

    function enginePrefix() {
      var workflow = getWorkflow();
      return 'blah' + workflow.config.name + '-';
    }

    function currentWorkflowKey(keyParam) {

      // keyStore - - - - - - - - - - - >
      var keyStore = {
        keyHolder: $('#title'),
        validate: function(key) {
          key = this.externalize(key);
          for (var w=0 ; w<_WORKFLOWS_.length; w++) {
            if (key === _WORKFLOWS_[w][0]) {
              return true;
            }
          }
          return false;
        },
        externalize: function(key) {
          if (key.startsWith('#')) {
            return key.substring(1);
          } else {
            return key;
          }
        },
        internalize: function(key) {
          if (!key.startsWith('#')) {
            return '#' + key;
          } else {
            return key;
          }
        },
        get: function() {
          var internalKey = this.keyHolder.data('id'); 
          return this.externalize(internalKey);
        },
        set: function(key) {
          var internalKey = this.internalize(key); 
          this.keyHolder.data('id', internalKey); 
          return this.externalize(key);
        }
      }
      // </ - - - - - - - - - - - keyStore

      if (typeof keyParam !== "string" || keyParam.length == 0) {
        return keyStore.get();
      }

      var valid = keyStore.validate(keyParam);

      if (valid) {
        return keyStore.set(keyParam);
      } else {
        return keyStore.get();
      }
    };

    function getWorkflow(key) {
      return workflows[currentWorkflowKey(key)]; 
    };

    function getWorkflowSteps(key) {
      return getWorkflow(key).steps; 
    };

    function setCurrentStep(s) {
      function pad(num, size) {
          var s = num+"";
          while (s.length < size) s = "0" + s;
          return s;
      }      

      $('#step-index').text(pad(s, 2));
    };
    function getCurrentStep() {
      return parseInt($('#step-index').text()); 
    };
    function getCurrrentStep() {
      return getWorkflowSteps()[getCurrentStep()]; 
    };

    function initSteps(key) {
      $('.breadcrumb').empty();
      var workflow = getWorkflow(key);
      if (!workflow) {
        return;
      }
      var steps = workflow.steps;
      for (var s = 1; s < steps.length; s++) {
        // var o = steps[s].abject ? (" '"+steps[s].abject+"'") : '';
        var $li = $('<li id="'+s+'">').text(steps[s].verb /* + o */ );
        if (steps[s].desc) {
          $li.attr('title', $("<div>"+steps[s].desc+"</div>").text());
        }
        $('.breadcrumb').append($li);
      }
      $('ol.breadcrumb li').attr('data-toggle', "tooltip").attr('data-placement', "bottom");
      $('[data-toggle="tooltip"]').tooltip();
      $('#initialMessage').html(workflow.config.initialMessage);
      $('#title').text(workflow.config.title);
      setStep(0);
    }

    function setStep(s) {
      var steps = getWorkflowSteps();
      if (s < 0 || steps.length <= s) {
          return;
      }

      if (s == 0) { // no prev
          $('.disabled_at_start').prop('disabled', true)
      } else {
          $('.disabled_at_start').prop('disabled', false)
      }

      if (steps.length-1 <= s) { // no next
          $('#babar button#next').prop('disabled', true);
          $('#babar button#next #next-verb').empty();
          $('#babar span#desc').text("done!");
      } else {
          $('#babar button#next').prop('disabled', false);
          $('#babar button#next #next-verb').html(steps[s+1].verb + (steps[s+1].chain ? " &#x2026;" : ""));
          $('#babar span#desc').html(steps[s+1].desc ? steps[s+1].desc : "");
      }

      var endOfChain = s+1;
      for (; endOfChain < steps.length; endOfChain++) {
        if (!steps[endOfChain].chain) {
          break;
        }
      }

      for (var i=1; i<steps.length; i++) {
          var style = { 
            color             : "black", 
            'font-style'      : "normal", 
            'text-decoration' : "none", 
            'font-family'     : "monospace", 
            'font-size'       : "smaller"
          };

          if (i <= s) {
              style["text-decoration"] = "line-through";
          } else {
              style.color = "gray";
          }
          if (s < i && i <= endOfChain) {
              style.color = "brown";
          }
          $('.breadcrumb li#'+i).css(style);
      }

      setCurrentStep(s);

      return s;
    }

    //////////////////////////////////////////////////////////////

    $('#babar button#next' ).off('click').on('click', function(event) {
      event.preventDefault();

      $('#babar div.alert').hide();

      var workflow = getWorkflow();
      var steps = workflow.steps;

      for (var chain=1, next; chain; chain = steps[next].chain) {
        var curr = getCurrentStep();
        
        next = setStep( curr + 1 );

        if (typeof steps[curr].undo === "undefined") {
            steps[curr].undo                = $.extend(true, {}, workflow.config);
            steps[curr].undo.commitData     = $.extend(true, [], workflow.sandbox.hv.commitData);
            steps[curr].undo.originData     = $.extend(true, [], workflow.sandbox.cb.originView.commitData);
            steps[curr].undo.currentBranch  =                    workflow.sandbox.hv.currentBranch;
        }

        /* !!!!!!!!!!!!!!!!!!!!!!!!!!!! array arguments is modifed by verb !!!!!!!!!!!!!!!!!!!!!!!!!!!! */
        if (_.isArray(steps[next].abject)) {
          args = steps[next].abject.slice(0);
        } else {
          args = steps[next].abject;
        }

        if (steps[next].verb == 'commit' && steps[next].abject) {
          args = { id:steps[next].abject };
        }

        try {
          getWorkflow().sandbox[steps[next].subject][steps[next].verb](args);
        } catch (error) {
          $('#babar div.alert').show().children('span#error').text(error);
          break;
        }
      }

      if (true /* workflow.url */ ) {
        fetchCode();
        d3.selectAll('circle').classed('clicked', false);
        $('g.commits circle').off('click').on('click', onCircleClick);
        $('g.pointers line, g.pointers polyline').off('click').on('click', onArrowClick);
      }

    });

    $('#babar button#prev' ).off('click').on('click', function(event) {
      event.preventDefault();

      $('#babar div.alert').hide();

      var workflow = getWorkflow();
      var steps = workflow.steps;
      var curr = getCurrentStep();
      if (curr == 0){
        return;
      }

      var prev = setStep( curr - 1 );
      if (typeof steps[prev].undo !== "undefined") {
        openConfig( workflow, steps[prev].undo );
      }
    });

    //////////////////////////////////////////////////////////////
    
    function fetchCode(commitParam, $elementParam, $title) {
      var workflow = getWorkflow();
      if (workflow /* && workflow.url */ ) {

        var step = getCurrrentStep();
        if (step) {

          var commit = commitParam || step.commit || workflow.sandbox.hv.getCommit('HEAD').id;
          if (!commit) {
              $('#sample').empty();
              return;
          } else {

            var url;
            if (workflow.url) {
              url = workflow.url.replace(/\$CommitId/gi, commit);
              if ($title) {
                $title.empty().text(url);
              }
            }

            var crossDomain = false;
            if (url) {
              if (url.indexOf('//') != -1 && url.indexOf(window.location.hostname) == -1) {
                crossDomain = true;
                var encodedURL = encodeURI(url);
                url = "https://development.neo.ondemand.com/proxy.jsp?"+encodedURL;
              }
            }

            var $element = $elementParam || $('#sample div:last-child');
            if ($element) {

              var $highlightjsinstance = $('#highlightjstemplate').clone();
              var $code = $highlightjsinstance.children('code');

              var laodingFailed = false;

              var toujours = function() {
                $code.each(function(i, block) {
                  hljs.highlightBlock(block);
                  $stickycommitid = $('#stickycommitidtemplate').clone();
                  $stickycommitid.text(commit);
                  $(block).append($stickycommitid);
                  if (isHead(commit, workflow)) {
                    $(block).addClass('head');
                  } else {
                    $(block).removeClass('head');
                  }
                  if (laodingFailed) {
                    $(block).addClass('alert-warning');
                  } else {
                    $(block).removeClass('alert-warning');
                  }
                });
                // $highlightjsinstance.show();
                // $element.show();
                $element.empty().append($highlightjsinstance);
              };

              if (!url) {
                toujours();
              } else {
                $.ajax( {
                  url: url,
                  crossDomain: crossDomain,
                }).done(function(data) {
                  var qwe = data;
                  if (data.documentElement) {
                    qwe = new XMLSerializer().serializeToString(data.documentElement);
                  }

                  laodingFailed = false;

                  $code.empty().text(qwe);

                }).fail(function( jqXHR, textStatus, errorThrown ) {

                  laodingFailed = true;

                  $code.text(
                    "<error>\n" +
                    "  <commit>" + commit + "</commit>\n" +
                    "  <url>" + url + "</url>\n" +
                    "  <textStatus>" + textStatus + "</textStatus>\n" +
                    "  <errorThrown>" + errorThrown + "</errorThrown>\n" +
                    "</error>"
                  );
                }).always(toujours);
              }
            }
          }
        }
      }
    }

    function isHead(commit, workflowParam) {
      var workflow = workflowParam || getWorkflow();
      var head = workflow.sandbox.hv.getCommit('HEAD');
      return head.id == commit; 
    }

    function getCommitsFromSvgId(svgId) {
      var tmp;

      var prefix = enginePrefix();

      if (svgId.indexOf(prefix+'Origin-') != -1) {
        tmp = svgId.substring((prefix+'Origin-').length);
      } else if (svgId.indexOf(prefix != -1)) {
        tmp = svgId.substring(prefix.length);
      }
      if (!tmp) {
        return;
      }

      var from;
      var to;

      var indexOfTo = tmp.indexOf('-to-');
      if (indexOfTo != -1) {
        from = tmp.substring(0, indexOfTo);
        to = tmp.substring(indexOfTo + '-to'.length + 1);
      } else {
        from = tmp;
      }

      return {from:from, to: to};
    }

    function onCircleClick(event) {
      event.preventDefault();

      d3.selectAll('circle').classed('clicked', false);
      d3.select(this).classed('clicked', true);

      var modal = false;

      var commits = getCommitsFromSvgId(this.id);

      if (commits) {
        if (!modal) {
          if (commits.from) {
            fetchCode(commits.from);
          }
        } else {
          var $content = $('<div/>');
          var $title   = $('<div/>').css('color', isHead(commits.from) ? "green" : "gray");

          if (commits.from) {
            fetchCode(commits.from, $content, $title);
          }

          $('#myModal .modal-body   > div#con').empty().append($content);
          $('#myModal .modal-header > div#tit').empty().append($title);

          $('#myModal').modal({keyboard: true});
        }
      }
    }    

    function onArrowClick(event) {
      event.preventDefault();

      var commits = getCommitsFromSvgId(this.id);

      if (commits) {

        var $row       = $('<div class="row" />');
        var $divFrom   = $('<div id="from" class="col-lg-6" />');
        var $divTo     = $('<div id="to"   class="col-lg-6" />');
        var $title     = $('<div class="span" />');
        var $titleFrom = $('<div style="text-align:right" />').css("color", isHead(commits.from) ? "green" : "gray");
        var $titleTo   = $('<div style="text-align:left"  />').css("color", isHead(commits.to)   ? "green" : "gray");

        if (commits.from) {
          fetchCode(commits.from, $divFrom, $titleFrom);
        }
        if (commits.to) {
          fetchCode(commits.to, $divTo, $titleTo);
        }

        $row.append($divTo);
        $row.append($divFrom);
        $('#myModal .modal-body > div#con').empty().append($row);

        $title.append($titleTo);
        $title.append($titleFrom);
        $('#myModal .modal-header > div#tit').empty().append($title);

        $('#myModal').modal({keyboard: true});
      }
    }    

    //////////////////////////////////////////////////////////////

    function openConfig(workflow, alternateConfig) {
      $('#babar div.alert').hide();
      
      explainGit.reset();

      if (workflow) {
        $('.concept-container').attr('id', enginePrefix()+'Container');
        var config = alternateConfig || workflow.config;
        if (config) {
          workflow.sandbox = explainGit.open($.extend(true, {}, config));

          if (true /* workflow.url */ ) {
            $('.playground-container').addClass('url');
            $('#sample').show().children('div').empty();

            fetchCode();

            d3.selectAll('circle').classed('clicked', false);
            $('g.commits circle').off('click').on('click', onCircleClick);
            $('g.pointers line, g.pointers polyline').off('click').on('click', onArrowClick);
          } else {
            $('.playground-container').removeClass('url');
            $('#sample').hide().children('div').empty();
          }

        }
      }
    }

    function resetAndOpen(key) {
      var workflow = getWorkflow(key);
      if (!workflow) {
        return;
      }
      initSteps(key);
      openConfig(workflow);
    }
  
    resetAndOpen(window.location.hash);

    //////////////////////////////////////////////////////////////

  }); // document ready

}); // require 

