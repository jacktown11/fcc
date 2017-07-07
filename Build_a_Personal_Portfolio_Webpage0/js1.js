window.onload = function(){
  changeLabel();
  dynamicNav();
};
function changeLabel(){
  //change label's position, color and visibility in form
  var form1 = document.getElementById("form"),
      labelsOld = document.getElementsByTagName("label"),
      len = labelsOld.length,
      inputs = new Array(len),
      labels = new Array(len);
  var getOrder = function(ele){
    //get a form field's order in the form
      if(typeof ele === "object" && typeof ele.id === "string"){
        switch(ele.id.toLowerCase()){
          case "name":
            return 0;
          case "email":
            return 1;
          case "phone":
            return 2;
          case "message":
            return 3;
          default:
            return -1;
        }
      }
      return -1;
  };
  var handleFocus = function(){
        var j = getOrder(this); 
        //get the event target's order in the form
        if(j>=0){
          labels[j].style.color = "#722872";
          var thisele = this,
              show = (labels[j].style.visibility === "visible"), 
              //判断当前是否显示着label
              checkInput = function(){
                //check the input's state to toggle its look
                if(thisele.value.length !== 0 
                  && thisele.value !== thisele.defaultValue){
                  //有非默认值的输入字符串
                  if(!show){
                    labels[j].style.top = "0";
                    labels[j].style.visibility = "visible";  
                    show = true;                  
                  }
                }else{
                  //没有字符输入
                  if(show){
                    labels[j].style.top = "2em";
                    labels[j].style.visibility = "hidden";
                    show = false;                    
                  }
                }
                if(thisele === document.activeElement){
                  setTimeout(checkInput,10);  //该表单项还有焦点，继续检测
                }
              };
          setTimeout(checkInput,10);
        }
      },
      handleBlur = function(){
        var j = getOrder(this);
        if(this.value){
          //effective value in the field now
          labels[j].style.color = "#888888";
        }else{
          //the field is still empty so hidden its label
          labels[j].style.visibility = "hidden";
          labels[j].style.top = "2em";
          labels[j].style.color = "#722872";
        }
      };
  for(var i = 0; i < len; i++){
    labels[i] = labelsOld[i];
    inputs[i] = document.getElementById(labels[i].getAttribute("for"));
    inputs[i].onfocus = handleFocus;
    inputs[i].onblur = handleBlur;
  }
}
function dynamicNav(){
  var body = document.body,
      about = document.getElementById("about"),
      portfolio = document.getElementById("portfolio"),
      contact = document.getElementById("contact"),
      navAbout = document.getElementById("nav-about"),
      navPortfolio = document.getElementById("nav-portfolio"),
      navContact = document.getElementById("nav-contact"),
      currentPos = 0,
      portfolioTop = getOffsetTop(portfolio),
      contactTop = getOffsetTop(contact);
  
  var updateActiveNav = function(activeEle){
        //set the activeEle as "active" class
        //and delete other ele's "active" class
        if(typeof activeEle === "object"){
          switch(activeEle){
            case about:
            case navAbout:
              addClass(navAbout,"active");
              removeClass(navPortfolio,"active");
              removeClass(navContact,"active");
              break;
            case portfolio:
            case navPortfolio:
              addClass(navPortfolio,"active");
              removeClass(navAbout,"active");
              removeClass(navContact,"active");
              break;
            case contact:
            case navContact:
              addClass(navContact,"active");
              removeClass(navPortfolio,"active");
              removeClass(navAbout,"active");
              break;
          }
        }
      },
      setNavOnclick = function(navEle,navElePos){
        navEle.onclick = function(eve){
          var event = (eve)?eve:window.event;
          if(event.preventDefault){
              event.preventDefault();
          }else{
              event.returnValue = false;
          }
          transDocScrollTopTo(navElePos);
          //sroll the document the navEle's target part
          updateActiveNav(navEle);
          //update the nav's look
        };
      },
      handleScroll = function(){
        //judge which part is in the viewport
        //and update the navigation's look
        if(getDocScrollTop() < portfolioTop){
          updateActiveNav(about);
        }else if(getDocScrollTop() < contactTop){
          updateActiveNav(portfolio);
        }else{
          updateActiveNav(contact);
        }
      };

  setNavOnclick(navAbout,0);
  setNavOnclick(navPortfolio,portfolioTop);
  setNavOnclick(navContact,contactTop);

  document.onmousewheel = handleScroll;
  document.onDOMMouseWheel = handleScroll;//for lower edition ff
  document.onwheel = handleScroll;//for lower edition ff
  
}

function getOffsetTop(ele){
  //get element(ele)'s position from the start of the document
  var top = 0;
  do{
    top += ele.offsetTop;
    ele = ele.offsetParent;
  }while(ele !== null);
  return top;
}
function addClass(ele,cls){
        if(typeof ele === "object" 
          && typeof cls === "string"
          && cls.length > 0)
        {
          var pos = -1;
          if(!ele.className || (pos = ele.className.indexOf(cls)) < 0){
            ele.className += " " + cls;
          }
        }
      }
function removeClass(ele,cls){
  if(typeof ele === "object" 
    && typeof cls === "string" 
    && cls.length > 0
    && ele.className)
  {
    var pos = -1;
    while((pos = ele.className.indexOf(cls)) >= 0){
      ele.className = ele.className.replace(cls,"");
    }
    ele.className = ele.className.replace(/ +/g," ");
    ele.className = ele.className.trim();
  }     
}
function getDocScrollTop(){
  return Number(document.documentElement.scrollTop 
  || window.pageYOffset 
  || document.body.scrollTop);
}
function setDocScrollTop(height){
  document.documentElement.scrollTop = height;
  if(getDocScrollTop() !== height){
    // unsucceed
    document.body.scrollTop = height;
    if(getDocScrollTop() !== height){
      // unsucceed yet
      if(window.pageYOffset){
        window.pageYOffset = height;
      }
    }
  }
}
function transDocScrollTopTo(end){
  //change the ele's scrollTop value from start to end gradually
  if(typeof end === "number"){
    var dist = end-getDocScrollTop(), //distance to the target position
        sign = dist>=0?1:-1,
        nextStep = 1,
        update = function(){
          if(dist !== 0){
            nextStep *= 2;
            var increase = (nextStep>=sign*dist)?
                           dist:
                           sign*(nextStep);  
            setDocScrollTop(getDocScrollTop()+increase);
          }
          dist = end-getDocScrollTop(); //update dist
          if(dist !== 0){
            setTimeout(update,100);
          }
        };
    setTimeout(update,0);
  }
}
