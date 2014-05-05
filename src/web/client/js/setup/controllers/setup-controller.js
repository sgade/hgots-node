(function() {
  "use strict";
  
  function setStep(index) {
    var currentIndex = $(".steps").data('current');
    if ( currentIndex === undefined ) {
      console.log("inital step:", index);
      $(".steps li").fadeOut(0);
      $(".steps li").eq(index).fadeIn(0);
    } else {
      
      if ( currentIndex == index ) {
        return;
      }
      console.log("set index", index, "with current index", currentIndex);
      
      $(".steps li").fadeOut(250).eq(index).fadeIn();
      $(".steps").data('current', index);
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
  
  $("#setup-save-admin").click(function() {
    setStep(1);
  });
  $("#setup-back-admin").click(function() {
    setStep(0);
  });
  $("#setup-save-settings").click(function() {
    setStep(2);
    submitData();
  });
  
  setStep(0);
  $("#setup-end").attr('disabled', true);
}());
