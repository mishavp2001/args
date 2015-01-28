<script type="text/javascript">
if ((typeof CQ == "undefined")  && (typeof include_codeBlock_once == "undefined")) {
//<![CDATA[
  window.addEventListener("message",function(a){
      if(a.origin.indexOf("intuit.com")>=1&& a.data && a.data.initXDM) {
         var b=document.createElement("script");
         b.setAttribute("type","text/javascript");
         b.innerHTML=a.data.initXDM;
         document.getElementsByTagName("head")[0].appendChild(b)}});
 // ]]>

  var include_codeBlock_once = true;

  // This method will be invoked when qboXDM object is available
  function qboXDMReady() {
    qboXDM.getContext(function(context) {
      // Trigger a custom Event, when jquery is loaded
      function invoke_custom_event(context) {
        if (window.$) {
          $( "#turn-on-payroll").trigger( "qboXDMObjectIsAvailable", [{context: context}]);
        } else {
          setTimeout(function() { invoke_custom_event(context) }, 50);
        }
      }

      invoke_custom_event(context);
    });
  }

  $(document).ready(function () {
    var context,
        payroll_data,
        debug = true,
        radio_select_val = 'qbop',
        show_ifsp_form = false,
        wholesale_accountant_flow = false;

    // Library method
    var ipd_qbo_lib_module = function () {
      var url_helper = function (page_id) {
        var preview = false,
            seperator = '?',
            url = '';

        url = '/ipd/payroll/payroll_recommender/' + page_id + '/';
        if (preview) {
          url += '?preview=true';
          seperator = '&';
        }

        return url;
      };

      var qbo_environment = function () {
        var qbo_env = false;

        if (window.location.href.indexOf('qbo.intuit') != -1) {
          qbo_env = true;
        }

        return qbo_env;
      };

      var click_tracking_qboTrack = function (method, action, workflow, workflowDetails, area) {
        if (typeof qboXDM !== "undefined") {
          var arr = [action, workflow, workflowDetails, area];
          qboXDM.track(method, arr);
          if (debug) {
            console.log("click track, method=" + method + " " + arr);
          }
        }
      };

     var get_payroll_data_service = function () {
        if (typeof qboXDM !== "undefined") {
          var url = context.qbo.baseUrl + "/productservice/v1/ipd/" + context.qbo.realmId + "/getdata";

          var promise = $.ajax({
            type: "get",
            url: url,
            timeout: 10000,
            beforeSend: function(xhr) { 
              xhr.setRequestHeader("Content-Type","application/json");
              xhr.setRequestHeader("Accept","application/json"); 
            },
            xhrFields: {
              withCredentials: true
            }
          });
          return promise;
        } 
        return false;
      };

      return {
        url_helper : url_helper,
        qbo_environment : qbo_environment,
        click_tracking_qboTrack : click_tracking_qboTrack,
        get_payroll_data_service : get_payroll_data_service
      };
    }();

    // Initial setup module
    var init_setup_module = function () {
      var add_page_wrapper_divs = function () {
        var html = '',
            page_ids = ['recommended-qbop', 'recommended-ifsp', 
                          'get-your-free-trial', 'confirmation', 'recommended-accountant'];

        $( "body" ).wrapInner( "<div id=\"turn-on-payroll\" class=\"top-level-container\" style=\"display:none;\"></div>" );
        $("#turn-on-payroll .turn-on-payroll-header, #turn-on-payroll .turn-on-payroll-main, #turn-on-payroll .turn-on-payroll-footer").show();
        $.each( page_ids, function( i, page_id ) {
          html += "<div id=\"" + page_id + "\" class=\"top-level-container\" style=\"display:none;\"></div>" + "\n";
        });
        html += '<iframe height="1" width="1" frameborder="0" src="" id="ifsp_form_iframe"></iframe>';
        $("#turn-on-payroll").after( html);
      };

      return {
        add_page_wrapper_divs : add_page_wrapper_divs
      };
    }();

    // payroll recommender module
    var sbm_ipd_obj_module = (function() {
      function wholesale_or_nonwholesale_flow() {
        if (check_wholesale_accountant_flow()) {
          get_data_recommended_helper(ipd_qbo_lib_module.url_helper('recommended_accountant'), 
            '#recommended-accountant', true);
        } else {
          show_selected_div("#turn-on-payroll");
          check_radio_change();
        }
      }

      function check_wholesale_accountant_flow() {
        var isAccountantSku, wscompanyType;

        if (window.location.href.indexOf('accountant=') != -1) {
          wholesale_accountant_flow = true;
        } else {
          if ( (! $.isEmptyObject(context)) && (! $.isEmptyObject(context.qbo)) ) {
            if ((! $.isEmptyObject(payroll_data)) && (! $.isEmptyObject(payroll_data.companyType)) &&
                (payroll_data.companyType.toUpperCase() == 'QBOMANAGED_WS')  ) {
              wscompanyType = true;
            }
            isAccountantSku = context.qbo.sku.isAccountantSku;

            if (isAccountantSku && wscompanyType) {
              wholesale_accountant_flow = true;
            }
          }
        }

        if (debug) {
          console.log("wholesale_accountant_flow=" + wholesale_accountant_flow);
        }

        return wholesale_accountant_flow;
      };

      function get_data_ajax(url, wrapper_selector) {
          return $.get(url, function(data) {
            var body = $(data).filter("header, #main, footer");
            $(wrapper_selector).append(body);
        });
      }

      function get_data_recommended_helper(url, page_id, show_on_success) {
        function has_children(id) {
          return $(id).children().length;
        }

        if (! has_children(page_id)) {
          $.when(
            get_data_ajax(url, page_id)
          ).then(function() {
            if (show_on_success) {
              show_selected_div(page_id);
              show_on_success = false;
            }

            // These are wholesale related 
            // Might need to use promise to refactor and move these elsewhere
            check_and_set_company_name(page_id);
            set_wholesale_disclaimer(page_id);
          }).fail(function(){
            //get_data_ajax(url, page_id); // try get data again
            //console.log( "something went wrong!" );
          });
        } 
      }

      function show_selected_div(selector) {
        $(".top-level-container").hide();
        $(selector).show();
        //$(selector).fadeIn("fast");
      }

      function set_wholesale_disclaimer(page_id) {
        if ((! $.isEmptyObject(payroll_data)) && (! $.isEmptyObject(payroll_data.payrollDisclaimerText)) ) {
          if ((page_id === '#recommended-accountant') || (page_id === '#recommended-qbop')) {
            $(page_id + " .cdisclosure-text").html('<p>' + payroll_data.payrollDisclaimerText + '</p>');
          }
        }
      }

      // For wholesale flow title dynamically change, based on companyName
      function check_and_set_company_name(page_id) {
        if ((page_id === '#recommended-accountant') && (! $.isEmptyObject(context)) ) {
          $(".company-name").html(context.qbo.companyName);
        }
      }

      // Radio select on turn on payroll page
      function check_radio_change() {
        var button_id = '#see-your-plan';
        var $radios = $('input:radio[name=payroll_choice]');
        $radios.filter('[value=qbop]').prop('checked', true);
        get_data_recommended_helper(ipd_qbo_lib_module.url_helper('recommended_qbop'), '#recommended-qbop');

        $("input[name=payroll_choice]:radio").change(function () {
          radio_select_val = $('input[name=payroll_choice]:checked').val();
          if (radio_select_val == 'qbop') {
            //show_selected_div('#recommended-qbop');
          } else {
            get_data_recommended_helper(ipd_qbo_lib_module.url_helper('recommended_ifsp'), '#recommended-ifsp');
          }
        })
      }

      function wholesale_click_event() {
        $('#recommended-accountant').on("click", "#next", function(e) {
          ipd_qbo_lib_module.click_tracking_qboTrack("trackWorkflowEndAction", "next", "addpayroll", {product: "qbop"} , "stickyfooter");
          try_online_payroll();
          e.preventDefault();
        });
      }

      function turn_on_payroll_click_event() {
        $('#turn-on-payroll').on("click", "#see-your-plan", function(e) {
          if (radio_select_val == 'qbop') {
            ipd_qbo_lib_module.click_tracking_qboTrack("trackLinearFlowAction", "seeyourplan", "chooseplan", {plan:"qbop"} , "planinfoqbop");
            show_selected_div('#recommended-qbop');
          } else {
            ipd_qbo_lib_module.click_tracking_qboTrack("trackLinearFlowAction", "seeyourplan", "chooseplan", {plan:"ifsp"} , "planinfoifsp");
            show_selected_div('#recommended-ifsp');
            get_data_recommended_helper(ipd_qbo_lib_module.url_helper('get_your_free_trial'), '#get-your-free-trial');
          }
          e.preventDefault();
        }); 
      }

      function recommended_pbop_click_event() {
        $('#recommended-qbop').on("click", ".back", function(e) {
          show_selected_div('#turn-on-payroll');
          e.preventDefault();
        });

        $('#recommended-qbop').on("click", "#try-now", function(e) {
          ipd_qbo_lib_module.click_tracking_qboTrack("trackWorkflowEndAction", "next", "addpayroll", {product: "qbop"} , "stickyfooter");
          try_online_payroll();
          e.preventDefault();
        });
      }

      function recommended_ifsp_click_event() {
        $('#recommended-ifsp').on("click", ".back", function(e) {
          show_selected_div('#turn-on-payroll');
          e.preventDefault();
        });

        $('#recommended-ifsp').on("click", "#try-now", function(e) {
          ipd_qbo_lib_module.click_tracking_qboTrack("trackLinearFlowAction", "next", "planinfo", {product: "ifsp"} , "ifspleadgen");
          show_selected_div('#get-your-free-trial');

          if (! show_ifsp_form) {
            show_ifsp_form = true;
            var form = $('.cform.ws-validate');

            //handling different path in showroom
            if (typeof(CQ) === 'undefined') {
              webshims.setOptions('basePath', '/assets/harmony/assets/form/js/shims/merged/minified/shims/');
            }

            //Trigger Form Init only when form element is found
            if (form.length) {
              webshims.polyfill('forms');
              webshims.ready('forms', function() {
                Intuit.Utils.Form.initialize(form);
              });
            }
          }
          e.preventDefault();
        });
      }

      function get_your_free_trial_form_click_event() {
        $('#get-your-free-trial').on("click", ".back", function(e) {
          show_selected_div('#recommended-ifsp');
          e.preventDefault();
        });

        //$('#get-your-free-trial').on("click", "#submit-button", function(e) {
        $('#get-your-free-trial').on("submit", function(e) {
          var $form_new_lead = $("#new_lead_data");
          var form_query = '';
          // Posting to Quickbase
          $.each($form_new_lead.serializeArray(), function(i, field) {
            if (form_query) {
              form_query += "&";
            }
            form_query += field.name + "=" + encodeURIComponent(field.value);
          });
          //var post_url = $form_new_lead.attr('action') + '?' + $form_new_lead.serialize();
          var post_url = $form_new_lead.attr('action') + '?' + form_query;
          $('#ifsp_form_iframe').attr('src', post_url);
          if (debug) {
            console.log("form_query=" + form_query);
            console.log("free trial form on submit post_url=" + post_url);
          }
          ipd_qbo_lib_module.click_tracking_qboTrack("trackWorkflowEndAction", "submit", "addpayroll", {product: "ifsp"} , "stickyfooter");
          e.preventDefault();
          // Test Validation before submit
          get_data_recommended_helper(ipd_qbo_lib_module.url_helper('confirmation'), '#confirmation', true);
        });
      }

      function handle_click_event() {
        //['#turn-on-payroll', '#recommended-qbop', '#recommended-ifsp', 
        //'#get-your-free-trial', '#confirmation', '#recommended-accountant'];
        wholesale_click_event();
        turn_on_payroll_click_event();
        recommended_pbop_click_event();
        recommended_ifsp_click_event();
        get_your_free_trial_form_click_event()
      };

      function try_online_payroll() {
        if ( (! $.isEmptyObject(context)) && (! $.isEmptyObject(context.qbo)) ) {
          var post_url = context.qbo.baseUrl + "/productservice/v1/payroll/" + context.qbo.realmId + "/add";

          function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) return parts.pop().split(";").shift();
          }

          // For now, keep showing spinner
          var timeOutCallback = function () {                            
            qboXDM.showSpinner(showSpinnerCallback);
          };

          // this callback is called right away by qboXDM.showSpinner with the argument obj containing timeoutInterval.
          // we set timer with that timeoutInterval to check if we need to continue to show spinner            
          var showSpinnerCallback = function (obj) {                
            // check after the timeoutInterval/2 if we need to continue to show spinner. 
            // timeoutInterval/2 rather than timeoutInterval so that we show the spinner continously rather than showing for 5 secs, hiding for a sec and showing again
            window.setTimeout(timeOutCallback, obj.timeout/2);                            
          }; 

          qboXDM.showSpinner(showSpinnerCallback);
          // end - show spinner before making the request

          $.ajax({
            type: "POST",
            url: post_url,
            timeout: 10000,
            data: JSON.stringify({"accessPoint": context.params.pc_upsell_ipd_ap}),
            beforeSend: function(xhr) { 
              xhr.setRequestHeader("CsrfToken", getCookie(context.qbo.cookiePrefix + ".ticket"));
              xhr.setRequestHeader("Content-Type","application/json");
              xhr.setRequestHeader("Accept","application/json"); 
            },
            xhrFields: {
              withCredentials: true
            }
          }).done(function(response, textStatus, jqXHR) {
            if (debug) { 
              console.log("response:",response);
              console.log("textStatus:",textStatus);
            }
            // reload qbo app and navigate to /app/employees?s=1
            //qboXDM.navigate("approute://employees?1");
            qboXDM.publishTopic("app/refresh-from-plugin", {"route": "/app/employees?s=1"});
          }).fail(function (jqXHR, textStatus) {
            qboXDM.hideSpinner();
            qboXDM.showSimpleDialog("Error in payroll activation", "Sorry, there is an prolem in payroll activation.  Please try again later.");
          });
        }
      }
     
      return {
        handle_click_event : handle_click_event,
        wholesale_or_nonwholesale_flow: wholesale_or_nonwholesale_flow
      };
    })();

    // Start here
    init_setup_module.add_page_wrapper_divs();
    sbm_ipd_obj_module.handle_click_event();

    // Force test accountant wholesale flow
    if (! ipd_qbo_lib_module.qbo_environment()) {
      sbm_ipd_obj_module.wholesale_or_nonwholesale_flow({});
    }

    // Custom Event waiting for qboXDM object to be available
    $( "#turn-on-payroll").on( "qboXDMObjectIsAvailable", function(e, data) {
      context = data.context;

      if (debug) {
        console.log("getting qboXDM context=");
        console.dir(context);
      } 
      var payroll_data_promise = ipd_qbo_lib_module.get_payroll_data_service();
      $.when(payroll_data_promise).done(function(response, textStatus, jqXHR) {
        payroll_data = response;
        if (debug) { 
          console.log("ipd get payroll data response:");
          console.dir(payroll_data);
        }
        sbm_ipd_obj_module.wholesale_or_nonwholesale_flow();
      });
    });
  });
}
else {
  //document.querySelector(".turn-on-payroll-header").style.display = "block";
  //document.querySelector(".turn-on-payroll-main").style.display = "block";
  //document.querySelector(".turn-on-payroll-footer").style.display = "block";
}
</script>