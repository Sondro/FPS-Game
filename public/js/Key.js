/**
 * Here are all the keys managed ... it works, but the code is a total disaster, i need to recode that asap
 */

var Key = {
    _pressed: {},
    _triggered: { },
    disabled : false,
    LEFT: 65, //A
    UP: 87, //W
    RIGHT: 68, //D
    DOWN: 83, //S
    JUMP: 32, //Spacebar
    FIRE: 1, //Leftclick
    RESPAWN: 66, //B
    RELOAD: 82, //R
    CHAT: 17,//Strg
    
    //There could be writte a better method for the trigger event or probably even a better aproach to the whole thing
    //But it works for now ... but should totaly be changed later on
    isDown: function(keyCode) {
        if(Key.disabled){
            //It is only posible to close the chat
            if(keyCode == this.CHAT && this._pressed[keyCode]){
                //Reload only needs to be trigger once
                var bool3;
                if(this._triggered[this.CHAT] != true) bool3 = true;
                else bool3 = false;

                this._triggered[this.CHAT] = true; 
                
                return bool3; 
            }
            return false;
        }

        if(keyCode == this.JUMP && this._pressed[keyCode]){
            //Jump only needs to be trigger once
            var bool;
            if(this._triggered[this.JUMP] != true) bool = true;
            else bool = false;

            this._triggered[this.JUMP] = true; 
            
            return bool;
        }
        else if(keyCode == this.RELOAD && this._pressed[keyCode]){
            //Reload only needs to be trigger once
            var bool2;
            if(this._triggered[this.RELOAD] != true) bool2 = true;
            else bool2 = false;

            this._triggered[this.RELOAD] = true;
            
            return bool2;
        }
        else if(keyCode == this.CHAT && this._pressed[keyCode]){
            //Reload only needs to be trigger once
            var bool3;
            if(this._triggered[this.CHAT] != true) bool3 = true;
            else bool3 = false;

            this._triggered[this.CHAT] = true; 
            
            return bool3;
        }
        else
            return this._pressed[keyCode];
    },
    //Checks if two or more keys are pressed at the same time for the camera controll
    multipleCamControllsPressed: function(){
        var counter;
        if(this._pressed[this.LEFT]) counter++;
        if(this._pressed[this.RIGHT]) counter++; 
        if(this._pressed[this.UP]) counter++; 
        if(this._pressed[this.DOWN]) counter++;

        return counter > 1;
    },
    onKeydown: function(event) {   
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._triggered[event.keyCode]
        delete this._pressed[event.keyCode];
    }
    
    

};

