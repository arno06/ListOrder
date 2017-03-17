"use strict";

var ListOrder = (function(){

    class ListOrder
    {
        constructor(pSelectorItems, pSelectorDrag, pUpdateHandler)
        {
            this.shadowClass = "list_order_shadow";
            this.dragClass = "list_order_drag";
            this.onChangedHandler = pUpdateHandler;
            this.selector = pSelectorItems;
            this.dragSelector = pSelectorDrag;
            this.currentOrder = "";
            this._mouseMoveHandler = this.mouseMoveHandler.bind(this);
            this._mouseUpHandler = this.mouseUpHandler.bind(this);

            document.querySelectorAll(this.selector).forEach((pElement)=>{
                pElement.querySelector(this.dragSelector).addEventListener("mousedown", this.mouseDownHandler.bind(this), false);
            });
        }

        mouseDownHandler(e)
        {
            this.currentOrder = "";
            var index = 0;
            document.querySelectorAll(this.selector).forEach((pElement)=>{
                this.currentOrder += ""+index+",";
                pElement.setAttribute("data-order", (index++));
            });
            var t = e.currentTarget.parentNode;

            var draggable = t.cloneNode(true);

            t.classList.add(this.shadowClass);

            draggable.classList.add(this.dragClass);
            draggable.style.width = (t.getBoundingClientRect().width - 20)+"px";
            draggable.style.top = t.offsetTop+"px";
            draggable.style.left = t.offsetLeft+"px";
            draggable.setAttribute("data-start", t.offsetLeft+","+ t.offsetTop);
            draggable.setAttribute("data-cursor", e.clientX+","+ e.clientY);

            t.parentNode.appendChild(draggable);

            document.addEventListener("mouseup", this._mouseUpHandler, false);
            document.addEventListener("mousemove", this._mouseMoveHandler, false);

        }

        mouseMoveHandler(e)
        {
            var t = document.querySelector("."+this.dragClass);
            var start = t.getAttribute("data-start").split(",");
            var client = t.getAttribute("data-cursor").split(",");

            var newTop = (Number(start[1]) + (e.clientY - Number(client[1])));

            t.style.left = (Number(start[0]) + (e.clientX - Number(client[0])))+"px";
            t.style.top = newTop+"px";

            var previousElement = null;
            var lastDiff = null;

            t.parentNode.querySelectorAll(t.nodeName).forEach((pElement)=>{
                if(pElement.classList.contains(this.shadowClass) || pElement.classList.contains(this.dragClass))
                    return;

                var top = pElement.offsetTop;

                if(top < newTop)
                {
                    if(lastDiff === null||lastDiff > (newTop-top))
                    {
                        lastDiff = newTop - top;
                        previousElement = pElement;
                    }
                }
            });

            var s = document.querySelector("."+this.shadowClass);
            t.parentNode.removeChild(s);

            var ref = t.parentNode.firstChild;

            if(previousElement)
            {
                ref = previousElement.nextSibling;
            }

            t.parentNode.insertBefore(s, ref);
        }

        mouseUpHandler()
        {
            document.querySelectorAll("."+this.shadowClass).forEach((pElement)=>{
                pElement.classList.remove(this.shadowClass);
            });
            document.querySelectorAll("."+this.dragClass).forEach((pElement)=>{
                pElement.parentNode.removeChild(pElement);
            });

            document.removeEventListener("mouseup", this._mouseUpHandler, false);
            document.removeEventListener("mousemove", this._mouseMoveHandler, false);


            var order = "";
            document.querySelectorAll(this.selector).forEach((pElement)=>{
                order += ""+pElement.getAttribute("data-order")+",";
            });

            if(order != this.currentOrder && this.onChangedHandler)
            {
                this.onChangedHandler(document.querySelectorAll(this.selector));
            }
        }
    }


    NodeList.prototype.forEach = Array.prototype.forEach;

    return {
        setup:function(pListElementSelector, pDragStartSelector, pChangedHandler)
        {
            return new ListOrder(pListElementSelector, pDragStartSelector, pChangedHandler);
        }
    };
})();