(function() {
  "use strict";
  
  function setButtonState(button, enabled) {
    if ( enabled ) {
      button.removeAttr('disabled');
    } else {
      button.attr('disabled', true);
    }
  }
  
  function authenticate() {
    if ( $("#setup-begin").length == 0 ) {
      return false;
    }
    
    $("#setup-admin-code").keyup(function() {
      var code = $("#setup-admin-code").val();
      var enabled = !!code;
      
      setButtonState($("#setup-begin"), enabled);
    });
    $("#setup-begin").attr('disabled', true);
    
    return true;
  }
  
  function setup() {
    function nextStep() {
      var currentIndex = $(".steps").attr('data-current');
      console.log(currentIndex);
      currentIndex++;
      setStep(currentIndex);
    }
    function prevStep() {
      var currentIndex = $(".steps").attr('data-current');
      currentIndex--;
      setStep(currentIndex);
    }
    function setStep(index) {
      var currentIndex = $(".steps").attr('data-current');
      if ( currentIndex === undefined ) {
        console.log("inital step:", index);
        $(".steps li").fadeOut(0);
        $(".steps li").eq(index).fadeIn(0);
        $(".steps").attr('data-current', index);
      } else {
        
        if ( currentIndex == index ) {
          return;
        }
        console.log("set index", index, "with current index", currentIndex);
        
        $(".steps li").fadeOut(250).eq(index).fadeIn();
        $(".steps").attr('data-current', index);
      }
    }
    
    function collectData() {
      return {};
    }
    function sendData(data, callback) {
      setTimeout(callback, 1000);
    }
    function submitData() {
      var data = collectData();
      sendData(data, function() {
        $("#setup-end").removeAttr('disabled');
      });
    }
    
    $("#setup-begin").click(function() {
      nextStep();
    });
    $("#setup-admin input").keyup(function() {
      var username = $("#setup-admin-username").val();
      var password = $("#setup-admin-password").val();
      var passwordRepeat = $("#setup-admin-password-repeat").val();
      var setupCode = $("#setup-admin-control").val();
      
      var nextOK = !!username && !!password && !!passwordRepeat && !!setupCode && password === passwordRepeat;
      if ( nextOK ) {
        $("#setup-save-admin").removeAttr('disabled');
      } else {
        $("#setup-save-admin").attr('disabled', true);
      }
    });
    $("#setup-save-admin").click(function() {
      nextStep();
    });
    $("#setup-back-admin").click(function() {
      prevStep();
    });
    $("#setup-save-settings").click(function() {
      nextStep();
      submitData();
    });
    
    setStep(0);
    $("#setup-save-admin").attr('disabled', true);
    $("#setup-end").attr('disabled', true);
  }
  
  if ( !authenticate() ) {
    setup();
  }
  
}());
