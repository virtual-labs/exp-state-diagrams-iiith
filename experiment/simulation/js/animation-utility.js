export function setCoordinates(xObject,yObject,textObject){
    gsap.set(textObject,{
        x: xObject,
        y: yObject
    })
};
export function fillInputDots(object,cxObject,cyObject,rObject,fillObject) {
    gsap.set(object, {
        attr: { cx: cxObject, cy: cyObject, r: rObject, fill: fillObject }
    });
}
export function objectDisappear(object){
    gsap.to(object, 0, { autoAlpha: 0 });
}
export function objectAppear(object){
    gsap.to(object, 0, { autoAlpha: 1 });
}
export function fillColor(object,color){
    gsap.set(object, {
        fill: color
    });
}
export function setColor(object) {
    
    fillColor(object,"#eeeb22");
}
export function unsetColor(object) {
    fillColor(object,"#29e");
}
