---
layout: 
---

{% assign datas = site.data | sort  %}

// will be initialized in angular-app.js
var _ANGULAR_LOCAL_STORAGE_PROXY_ = {
  get    : function() {},
  set    : function() {},
  remove : function() {}
};

;(function(){

require(['explaingit'], function (explainGit) {

  var _WORKFLOWS_ = [{% for files in datas %}
    {{ files | jsonify }},{% endfor %}
  ];

  $( document ).ready(function() {

    var codeMirrorEditor = CodeMirror.fromTextArea(document.getElementById("codemirror"), {
          // lineNumbers: true,
          mode: "text/xml",
          matchBrackets: true,
          scrollbarStyle: null
        });

    // miscelleanous inits ---------------------->
    $('#home').off('click').on('click', function(event) {
      event.preventDefault();
      resetAndOpen();
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

    function enginePrefix(nameParam) {
      var name = nameParam || getWorkflow().config.name;
      return 'blah' + name + '-';
    }

    function currentWorkflowKey(keyParam) {

      // keyStore - - - - - - - - - - - >
      var keyStore = {
        keyHolderSelector: 'section div h1 span#title',
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
          if (key && key.startsWith('#')) {
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
          var internalKey = $(this.keyHolderSelector).data('id') || _ANGULAR_LOCAL_STORAGE_PROXY_.get("key"); 
          var externalKey = this.externalize(internalKey); 
          return externalKey;
        },
        set: function(key) {
          var internalKey = this.internalize(key); 
          $(this.keyHolderSelector).data('id', internalKey); 
          _ANGULAR_LOCAL_STORAGE_PROXY_.set("key", internalKey);
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

    function initSteps(workflow) {
      $('.breadcrumb').empty();
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
      setStep(0, steps);
    }

    function setStep(s, stepsParam) {
      var steps = stepsParam || getWorkflowSteps();
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

        onCircleClick();

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
    
    function fetchCode(commitParam, done, fail, always) {
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
            }

            if (!url) {
              always();
            } else {
              $.ajax( {
                url: url,
              }).done(function(data) {
                var content = data;
                if (data.documentElement) {
                  content = new XMLSerializer().serializeToString(data.documentElement);
                }
                if (done) {
                  done(content);
                }
              }).fail(function( jqXHR, textStatus, errorThrown ) {
                var errorAsXml = 
                  "<error>\n" +
                  "  <commit>" + commit + "</commit>\n" +
                  "  <url>" + url + "</url>\n" +
                  "  <textStatus>" + textStatus + "</textStatus>\n" +
                  "  <errorThrown>" + errorThrown + "</errorThrown>\n" +
                  "</error>";
                if (fail) {
                  fail(errorAsXml);
                }
              }).always(function() {
                if (always) {
                  always(workflow, commit);
                }
              });
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

    var last_commit;

    function onCircleClick(event) {

      $('#oneFile').show();
      $('#twoFiles').hide();

      var to;
      if (event) {
        event.preventDefault();
        if (event.shiftKey) {
          to = last_commit;
          d3.selectAll('line, polyline').classed('clicked', false);
        } else {
          d3.selectAll('line, polyline, circle').classed('clicked', false);
        }
        d3.select(this).classed('clicked', true);
      } else {
        d3.selectAll('line, polyline, circle').classed('clicked', false);
      }

      var commit;
      if (this.id) {
        commits = getCommitsFromSvgId(this.id);

        if (to) {
          commits.to = to;
          showDiff(commits);
          return;
        } else {
          commit = commits.from;
        }
      }

      var $cm = $('#oneFile .CodeMirror-code');
      fetchCode(
        commit, 
        function(content) {
          $cm.removeClass('alert-warning');
          codeMirrorEditor.setValue(content);
        }, 
        function(error) {
          $cm.addClass('alert-warning');
          codeMirrorEditor.setValue(error);
        }, 
        function(workflow, commit) {
          last_commit = commit;
          $stickycommitid = $('#stickycommitidtemplate').clone();
          $stickycommitid.text(commit);

          var $cs = $('#oneFile .CodeMirror-scroll');
          $cs.append($stickycommitid);

          if (isHead(commit, workflow)) {
            $cm.addClass('head');
          } else {
            $cm.removeClass('head');
          }
        }
      );

    }    

    function showDiff(commits) {
      if (commits && commits.from && commits.to) {

        $('#oneFile').hide();
        $('#twoFiles').show();

        $('#compare').mergely({
          cmsettings: { readOnly: true, lineNumbers: false },
        });

        fetchCode(
          commits.from, 
          function(content) {
            $('#compare').mergely('rhs', content)
          }, function (error) {
            $('#compare').mergely('rhs', error)
          }, function (workflow, commit) {
          }
        );
        fetchCode(
          commits.to, 
          function(content) {
            $('#compare').mergely('lhs', content)
          }, function (error) {
            $('#compare').mergely('lhs', error)
          }, function (workflow, commit) {
          }
        );
      }
    }    

    function onArrowClick(event) {
      d3.selectAll('line, polyline, circle').classed('clicked', false);

      if (event) {
        event.preventDefault();
        d3.select(this).classed('clicked', true);
      }

      var commits = getCommitsFromSvgId(this.id);

      showDiff(commits);

    }    

    //////////////////////////////////////////////////////////////

    function openConfig(workflow, alternateConfig) {
      $('#babar div.alert').hide();
      
      explainGit.reset();

      if (workflow) {
        var config = alternateConfig || workflow.config;
        if (config) {
          $('.concept-container').attr('id', enginePrefix(workflow.config.name) + 'Container');
          workflow.sandbox = explainGit.open($.extend(true, {}, config));

          $('.playground-container').addClass('url');

          $('g.commits circle').off('click').on('click', onCircleClick);
          $('g.pointers line, g.pointers polyline').off('click').on('click', onArrowClick);

          onCircleClick();

          if ( workflow.url ) {
            $('#sample').show();
          } else {
            $('#sample').hide();
          }

        }
      }
    }

    function resetAndOpen(key) {
      var workflow = getWorkflow(key);
      if (!workflow) {
        return;
      }
      initSteps(workflow);
      openConfig(workflow);
    }

    var key = window.location.hash || _ANGULAR_LOCAL_STORAGE_PROXY_.get("key");

    // console.log('window.location.hash', window.location.hash ? window.location.hash : undefined,  'key', key); 
    
    resetAndOpen(key);

    //////////////////////////////////////////////////////////////

  }); // document ready

}); // require 

})();
