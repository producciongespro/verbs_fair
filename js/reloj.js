var i = -1;



function timedCount() {
    i++;
    postMessage(i);
    setTimeout("timedCount()",1000);
}
timedCount();
