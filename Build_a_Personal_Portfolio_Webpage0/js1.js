window.onload = function(){
  changeLabelPos();
  dynamicNav();
  test();
};
function changeLabelPos(){
  var form1 = document.getElementById("form"),
      labelsOld = document.getElementsByTagName("label"),
      len = labelsOld.length,
      inputs = new Array(len),
      labels = new Array(len);
  var getOrder = function(ele){
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
        if(j>=0){
          labels[j].style.color = "#722872";
          var thisele = this,
              show = (labels[j].style.visibility === "visible"), //当前是否显示着label
              checkInput = function(){
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
          labels[j].style.color = "#888888";
        }else{
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
      navAbout = document.getElementById("nav-about").firstChild,
      navPortfolio = document.getElementById("nav-portfolio").firstChild,
      navContact = document.getElementById("nav-contact").firstChild,
      currentPos = 0;
  var updateActiveNav = function(activeEle){
        if(typeof activeEle === "object"){
          switch(activeEle){
            case navAbout:
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
            transiteBodyScrollTop(body,body.scrollTop,navElePos);
            updateNavClass();
        };
      };
  var portfolioTop = getOffsetTop(portfolio),
      contactTop = getOffsetTop(contact);
  setNavOnclick(navAbout,0);
  setNavOnclick(navPortfolio,portfolioTop);
  setNavOnclick(navContact,contactTop);

  if(document.onmouseWheel){
    document.onmouseWheel = function(){
      updateNavClass(); 
    };
  }
  if(document.onDOMMouseScroll){
    document.onDOMMouseScroll = function(){
      updateNavClass();
    };
  }

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
        if(typeof ele === "object" && typeof cls === "string"){
          var pos = -1;
          if((pos = ele.style.className.indexOf(cls)) < 0){
            ele.style.className += " " + cls;
          }
        }
      }
function removeClass(ele,cls){
        if(typeof ele === "object" && typeof cls === "string"){
          var pos = -1;
          while((pos = ele.style.className.indexOf(cls)) >= 0){
            ele.style.className.replace(cls,"");
          }
          ele.style.className.replace(/ +/g," ");
          ele.style.className = ele.style.className.trim();
        }        
      }
function transiteBodyScrollTop(ele,start,end){
  //change the ele's scrollTop value from start to end gradually
  if(typeof ele === "object"
    && typeof start === "number" 
    && typeof end === "number"){
    var sign = (end-start)>=0?1:-1,
        nextStep = 1,
        update = function(){
          var dist = (end-ele.scrollTop);
          if(dist !== 0){
            nextStep *= 2;
            ele.scrollTop += (nextStep>=sign*(end-ele.scrollTop))?
            end-ele.scrollTop:
            sign*(nextStep);                
          }
          if((end-ele.scrollTop)!==0){
            setTimeout(update,100);
          }
        };
    setTimeout(update,0);
  }
}
function test(){
  var ele = document.createElement("div");
  ele.style.className = "this that goog time fun sssd";
  removeClass(ele,"that");
  console.log(ele.style.className);
}