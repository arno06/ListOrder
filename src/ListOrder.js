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
            this._mouseDownHandler = this.mouseDownHandler.bind(this);

            document.querySelectorAll(this.selector).forEach(this.registerItem.bind(this));
        }

        registerItem(pItem){
            pItem.querySelector(this.dragSelector).addEventListener("mousedown", this._mouseDownHandler, false);
        }

        mouseDownHandler(e)
        {
            document.querySelectorAll(this.selector).forEach((pElement, pIndex)=>{
                pElement.setAttribute("data-index", pIndex);
                pElement.setAttribute("data-order", pIndex);
            });
            this.currentOrder = Array.from(document.querySelectorAll(this.selector)).map((pElement)=>pElement.getAttribute("data-index")).join(",");

            const t = e.currentTarget.parentNode;

            const draggable = t.cloneNode(true);

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
            const t = document.querySelector("."+this.dragClass);
            const start = t.getAttribute("data-start").split(",");
            const client = t.getAttribute("data-cursor").split(",");

            t.style.left = (Number(start[0]) + (e.clientX - Number(client[0])))+"px";
            t.style.top = (Number(start[1]) + (e.clientY - Number(client[1])))+"px";

            let previousElement = null;

            t.parentNode.querySelectorAll(t.nodeName).forEach((pElement, pIndex)=>{
                if(pElement.classList.contains(this.shadowClass) || pElement.classList.contains(this.dragClass))
                    return;

                const offset = this.getOffset(pElement);

                if(e.clientX > offset.startX && e.clientX < offset.endX && e.clientY > offset.startY && e.clientY < offset.endY){
                    previousElement = pElement;
                }
            });

            if(!previousElement){
                return;
            }

            const s = document.querySelector("."+this.shadowClass);
            let pos = Number(s.getAttribute("data-order"));
            let rep = Number(previousElement.getAttribute("data-order"));
            t.parentNode.removeChild(s);
            let ref = previousElement;
            if(pos < rep){
                ref = previousElement.nextSibling;
            }
            t.parentNode.insertBefore(s, ref);
            document.querySelectorAll(this.selector).forEach((pElement, pIndex)=>{
                pElement.setAttribute("data-order", pIndex);
            });

        }

        getOffset(pElement){
            let offset = {startY:0, startX:0};
            const width = pElement.offsetWidth;
            const height = pElement.offsetHeight;
            let scrollTop = pElement.scrollTop;
            while(pElement){
                scrollTop += pElement.scrollTop||0;
                offset.startY += pElement.offsetTop||0;
                offset.startX += pElement.offsetLeft||0;
                pElement = pElement.parentNode;
            }
            offset.startY -= scrollTop;
            offset.endX = offset.startX+width;
            offset.endY = offset.startY+height;
            return offset;
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


            let order = Array.from(document.querySelectorAll(this.selector)).map((pElement)=>pElement.getAttribute("data-index")).join(",");

            if(order !== this.currentOrder && this.onChangedHandler)
            {
                this.onChangedHandler(document.querySelectorAll(this.selector));
            }
        }
    }

    return {
        setup:function(pListElementSelector, pDragStartSelector, pChangedHandler)
        {
            return new ListOrder(pListElementSelector, pDragStartSelector, pChangedHandler);
        }
    };
})();