import './filter-donors.styl'

import {Component} from 'utils'
import Axios from 'axios';

class FilterDonors extends Component {
    constructor(block) {
        super(block);

        this.el.form = this.getElement('filter-donors__form');
        this.el.list = this.getElement('filter-donors__list');
        this.el.btnFilterShow = this.getElement('filter-donors__button-aside');
        this.el.ranges = this.getElements('filter-donors__sidebar-range');
        this.el.sidebar = this.getElement('filter-donors__sidebar');

        this.el.listBlock = this.getElement('filter-donors__block');
        this.el.title = this.getElement('filter-donors__title');
        this.el.loaderBlock = this.getElement('filter-donors__loader');
        this.el.dataBlock = this.getElement('filter-donors__data');
        this.el.btnReset = this.getElement('filter-donors__reset');

        this.data.listPage = (this.el.dataBlock) ? this.el.dataBlock.dataset.page : 1;
        this.data.donorListHeight = this.el.list.scrollHeight;
        this.data.listPages = this.el.dataBlock.dataset.pages;
        this.data.windowWidth = window.innerWidth;
        this.data.isClear = false;

        this.data.isLoad = false; // Если подгружаем данные, не начинаем грузить новые

        this.events.submit = (e) => this.submit(e);
        this.events.listElementsReload = (data) => this.listElementsReload(data);
        this.events.filterShow = () => this.filterShow();
        this.events.mediaChange = () => this.mediaChange();
        this.events.heightSet = () => this.heightSet();

        this.events.listElementsLoad = () => this.listElementsLoad();
        this.events.loader = (state) => this.loader(state);
        this.events.getDonorsWithAjax = (page, params) => this.getDonorsWithAjax(page, params);
        this.events.btnResetClick = () => this.btnResetClick();

        this.el.form.addEventListener('submit', this.events.submit);
        this.el.btnFilterShow.addEventListener('click', this.events.filterShow);
        this.el.btnReset.addEventListener('click', this.events.btnResetClick);
        window.addEventListener('resize', this.events.mediaChange);
        window.addEventListener('scroll', this.events.listElementsLoad);

        this.events.mediaChange();
        this.heightSet();
    }

    submit(e) {
        if(e) {
            e.preventDefault();
        }

        for(let i = 0; i < this.el.ranges.length; i++) {
            this.el.ranges[i].valueSet();
        }

        this.el.dataBlock.dataset.page = 1;
        this.data.listPage = this.el.dataBlock.dataset.page;
        this.events.getDonorsWithAjax(this.data.listPage, true);

        this.el.sidebar.classList.remove('filter-donors__sidebar_active');
    }

    listElementsReload(data) {
        while (this.el.dataBlock.firstChild) {
            this.el.dataBlock.removeChild(this.el.dataBlock.firstChild);
        }

        setTimeout( () => {
            this.el.dataBlock.innerHTML = data;
        }, 1000);

        this.el.dataBlock.dataset.page = 1;
        this.data.listPage = this.el.dataBlock.dataset.page;
    }

    filterShow() {
        this.el.sidebar.classList.toggle('filter-donors__sidebar_active');
    }

    mediaChange() {
        if(this.data.windowWidth != window.innerWidth) {

            this.heightSet();

            if (window.matchMedia("(max-width: 1280px)").matches) {
                this.el.sidebar.classList.remove('filter-donors__sidebar_active');
            }

            this.data.windowWidth = window.innerWidth;
        }
    };

    heightSet() {
        this.el.listBlock.style.minHeight = this.el.form.offsetHeight + 'px';
    }

    listElementsLoad() {
        let scrollTop = window.pageYOffset;

        if ((scrollTop > this.data.donorListHeight) && !this.data.isLoad && this.data.listPage < this.data.listPages) {

            for(let i = 0; i < this.el.ranges.length; i++) {
                this.el.ranges[i].valueSet();
            }

            this.data.isLoad = true;
            this.events.loader(this.data.isLoad);
            this.data.listPage++;
            this.el.dataBlock.dataset.page = this.data.listPage;
            this.events.getDonorsWithAjax(this.data.listPage, false);
        }

    }

    loader(state) {
        if (state) {
            this.el.loaderBlock.classList.add('reviews-filter__loader_active');
        } else {
            this.el.loaderBlock.classList.remove('reviews-filter__loader_active');
        }
    }

    getDonorsWithAjax(page, isFullPage) {
        let data = this.data.isClear ? [] : new FormData(this.el.form);

        Axios({
            url: this.el.form.action,
            method: 'post',
            responseType: 'json',
            data: data,
            params: {
                type: 'bank',
                action: 'page',
                page: page,
                isFullPage: Number(isFullPage),
                clear: this.data.isClear ? 'y' : ''
            },
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then((response) => {
            let html = response.data; // Данные
            const lastPage = (response.data.last_page === 0) ? 1 : response.data.last_page;

            if(response.data.current_page <= lastPage) {
                if (response.data.current_page == 1) {
                    // Замена
                    this.events.listElementsReload(html.content);

                } else {
                    let tempElement = document.createElement('div');
                    tempElement.innerHTML = html.content;

                    this.el.list = this.getElement('filter-donors__list');

                    while (tempElement.hasChildNodes()) {
                        this.el.list.appendChild(tempElement.firstChild);
                    }

                }

                if(this.el.list) {
                    this.data.donorListHeight = this.el.list.scrollHeight;
                }
                this.data.isLoad = false;

                this.events.loader(this.data.isLoad);

                Debt.updateAll();

            } else {
                this.events.loader(false);
            }

            this.data.isClear = false;
        })
        .catch(function(error) {
            this.data.isClear = false;
        });

    }

    btnResetClick() {
        this.data.isClear = true;
        this.el.form.reset();

        for(let i = 0; i < this.el.ranges.length; i++) {
            this.el.ranges[i].reset();
        }

        this.submit();
    }

}

global.Debt.add('.filter-donors', FilterDonors);