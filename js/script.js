var onload = () => {
    document.querySelector('.welcome').style.display = 'flex'
    document.querySelector('.main').style.display = 'none'
    setTimeout(() => {
        game.init()
        document.querySelector('.welcome').classList.add('close');
        document.querySelector('.main').style.display = 'flex';
        setTimeout(() => {
            document.querySelector('.welcome').remove();
        },500)
    },3000)
}


var game = {
    canvas : null,
    layouts : {
        rows : 8,
        cols : 8
    },
    states : {
        blank : { 'id' : 0, 'color' : 'null'},
        black : { 'id' : 1, 'color' : 'black'},
        white : { 'id' : 2, 'color' : 'white'},
        prev : {'id' : 3, 'color' : 'rgba(255,255,255,0.35)'}
    },
    score : {
        black : 0,
        white : 0
    },
    thinkBot : [
        1000,2000,3000,4000,5000,6000,7000,8000,9000,10000
    ],
    turn : null,
    grids : [],
    
    init(){
        this.canvas = document.getElementById('game')
        this.buildBoard()
        this.initialGame()
    },
    buildBoard(){
        var table = document.createElement('table');
        for(var row = 1; row <= this.layouts.rows; row++){
            var tr = document.createElement('tr');
            table.appendChild(tr);
            this.grids[row] = [];
            for(var col = 1; col <= this.layouts.cols; col++){
                var td = document.createElement('td');
                tr.appendChild(td);
                var span = document.createElement('span');
                this.grids[row][col] = this.initAllBlank(td.appendChild(span));
                this.bindingMove(td, row, col);
            }
        }
        this.canvas.appendChild(table);
    },
    initialGame(){
        this.setState(4,4,this.states.white);
        this.setState(4,5,this.states.black);
        this.setState(5,4,this.states.black);
        this.setState(5,5,this.states.white);
        this.setScore(2,2);
        this.setTurn(this.states.black);
    },
    initAllBlank(element){
        return {
            'element' : element,
            'state' : this.states.blank
        }
    },
    setState(row, col, state){
        this.grids[row][col].state = state;
        if(state.id == 0){
            this.grids[row][col].element.style.visibility = 'hidden';
        }
        else{
            this.grids[row][col].element.style.visibility = 'visible';
            this.grids[row][col].element.setAttribute('id', `state_${state.id}`)
            this.grids[row][col].element.style.background = state.color;
        }
    },
    setScore(black, white){
        document.getElementById('black').innerHTML = `Black = ${black}`;
        document.getElementById('white').innerHTML = `White = ${white}`;
    },
    setTurn(state){
        this.turn = state;
        this.makePrev();
        if(state.id == this.states.black.id){
            document.getElementById('black').classList.add('info');
            document.getElementById('black').classList.add('active');
            document.getElementById('white').classList.remove('active');
            document.querySelector('.batas').innerHTML = '<';
        }
        if(state.id == this.states.white.id){
            document.getElementById('white').classList.add('info');
            document.getElementById('white').classList.add('active');
            document.getElementById('black').classList.remove('active');
            document.querySelector('.batas').innerHTML = '>';
            let randomThinkBot = [];
            for(var i = 0; i < 1; i++){
                let getRandom = Math.floor(Math.random() * this.thinkBot.length );
                randomThinkBot.push(this.thinkBot[getRandom]);
            }
            var waitBot = setTimeout(() => {
                this.moveBot()
                clearTimeout(waitBot)
                console.log(randomThinkBot)
            }, randomThinkBot)
        }
    },
    bindingMove(element, row, col){
        var self = this;
        element.onclick = () => {
            if(self.turn == self.states.black){
                if(this.isValidMove(row,col)){
                    self.move(row,col)
                    self.removePrev();
                }
                else{
                    var invalid = document.createElement('div');
                    document.querySelector('.container').appendChild(invalid);
                    invalid.innerHTML = 'Invalid Move';
                    invalid.classList.add('invalidMove');
                    var invalidTime = setTimeout(() => {
                        invalid.classList.add('active');
                        clearTimeout(invalidTime)
                    },200)
                    var removeActive = setTimeout(() => {
                        invalid.classList.remove('active')
                        clearTimeout(removeActive)
                    },2000)
                    var deleteInvalid = setTimeout(() => {
                        invalid.remove();
                        clearTimeout(deleteInvalid)
                    },2500)
                }
            }
        }
    },
    isValidMove(row, col){
        var rowCheck;
        var colCheck;
        var toCheck = (this.turn.id == this.states.black.id) ? 
        this.states.white : this.states.black;

        if(!this.isValidPosition(row,col) || this.isVisibleItem(row,col)){
            return false;
        }
        for(var rowDir = -1; rowDir <= 1; rowDir++){
            for(var colDir = -1; colDir <= 1; colDir++){
                if(rowDir == 0 && colDir == 0){
                    continue;
                }
                rowCheck = row + rowDir;
                colCheck = col + colDir;
                let found = false;

                while(this.isValidPosition(rowCheck,colCheck) &&
                this.isVisibleItem(rowCheck,colCheck) &&
                this.grids[rowCheck][colCheck].state.id == toCheck.id){
                    rowCheck += rowDir;
                    colCheck += colDir;
                    found = true;
                }
                if(found == true){
                    if(this.isValidPosition(rowCheck,colCheck) &&
                    this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == this.turn.id){
                        return true;
                    }
                }
            }
        }
        return false;
    }, 
    isValidPosition(row,col){
        return (row >= 1 && row <= this.layouts.rows) &&
        (col >=1 && col <= this.layouts.cols);
    },
    isVisibleItem(row, col){
        return this.isVisible(this.grids[row][col].state);
    },
    isVisible(state){
        return (state.id == this.states.black.id) || 
        (state.id == this.states.white.id);
    },
    move(row, col){
        let finalItems = [];
        var rowCheck;
        var colCheck;
        var toCheck = (this.turn.id == this.states.black.id) ? 
        this.states.white : this.states.black;

        if(!this.isValidPosition(row, col) || this.isVisibleItem(row,col)){
			return false;
		}
		for(var rowDir = -1; rowDir <= 1; rowDir++){
			for(var colDir = -1; colDir <= 1; colDir++){
				if(rowDir == 0 && colDir == 0){
					continue;
				}

				rowCheck = row + rowDir;
				colCheck = col + colDir;
				var possibleItems = [];

				while(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == toCheck.id){
					possibleItems.push([rowCheck, colCheck]);
					rowCheck += rowDir;
					colCheck += colDir;
				}
				if(possibleItems.length){
					if(this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grids[rowCheck][colCheck].state.id == this.turn.id){
						finalItems.push([row,col]);
						for(var item in possibleItems){
							finalItems.push(possibleItems[item]);
						}
					}
				}
			}
			if(finalItems.length){
				for(var item in finalItems){
					this.setState(finalItems[item][0], finalItems[item][1], this.turn);
				}
			}
		}
        this.setTurn(toCheck);
        this.calculateScore();
    },
    makePrev(){
        for(var row = 1; row <= this.layouts.rows; row++){
            for(var col = 1; col <= this.layouts.cols; col++){
                if(this.isValidMove(row,col)){
                    this.setState(row,col,this.states.prev)
                }
            }
        }
    },
    removePrev(){
        for(var row = 1; row <= this.layouts.rows; row++){
            for(var col = 1; col <= this.layouts.cols; col++){
                if(this.grids[row][col].state.id == 3){
                    this.setState(row,col,this.states.blank)
                }
            }
        }
    },
    calculateScore(){
        let blackScore = 0;
        let whiteScore = 0;
        for(var row = 1; row <= this.layouts.rows; row++){
            for(var col = 1; col <= this.layouts.cols; col++){
                if(this.grids[row][col].state.id == 1){
                    blackScore++
                }
                if(this.grids[row][col].state.id == 2){
                    whiteScore++
                }
            }
        }
        this.setScore(blackScore, whiteScore);
    },
    moveBot(){
        for(var row = 1; row <= this.layouts.rows; row++){
            for(var col = 1; col <= this.layouts.cols; col++){
                if(this.isValidMove(row,col)){
                    this.move(row, col);
                    return;
                }
            }
        }
    },
}