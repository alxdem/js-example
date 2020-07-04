import './counter.styl';
import { Component } from 'utils';

class Counter extends Component {
    constructor(block) {
        super(block);

        this.data.start = this.block.dataset.start;
        this.data.value = this.block.dataset.value;
        this.data.max = this.block.dataset.max;
        this.data.step = this.block.dataset.step;
        this.data.time = this.block.dataset.time;

        if(!this.data.step) {
            this.data.step = 1;
        }

        this.data.tick = this.data.time / this.data.max * 1000;

        if(this.data.value === undefined) {
            this.data.value = 1;
        }

        this.events.count = () => this.count();
    }

    count() {
        let i = this.data.start;

        let interval = setInterval(() => {
            this.block.textContent = i;
            i = Number(i) + Number(this.data.step);
            if(i > this.data.value) clearInterval(interval);
        }, this.data.tick);

    }

}

global.Debt.add('.counter', Counter);