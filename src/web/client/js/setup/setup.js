(function() {
  "use strict";
  
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
  $("#setup-end").attr('disabled', true);
}());
