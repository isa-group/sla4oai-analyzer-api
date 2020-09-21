
var log = "";

module.exports.logger =  {
    slog: new Array(),
    clearLog:  () => {
        this.slog=new Array();
    },
    getLog: () => {
        return this.slog;
    },
    debug: (s) =>{
        this.slog.push("DEBUG: "+s);
    },
    error: (s) =>{
        this.slog.push("ERROR: "+s);
    },
    validationWarning: (s) =>{
        this.slog.push(s);
    },
    validation: (s) =>{
        this.slog.push(s);
    }
}