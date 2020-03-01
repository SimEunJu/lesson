/**
 * Copyrightⓒ2020 by Moon Hanju (github.com/it-crafts)
 * All rights reserved. 무단전재 및 재배포 금지.
 * All contents cannot be copied without permission.
 */
const common = (function() {
    const IMG_PATH = 'https://it-crafts.github.io/lesson/img';
    const fetchApiData = async (url, page = 'info') => {
        const res = await fetch(url + page);
        const data = await res.json();
        return data.data;
    }

    return { IMG_PATH, fetchApiData }
})();

const Root = (() => {
    const Root = function(selector) {
        this.$el = document.querySelector(selector);
        this._page;
    };
    const proto = Root.prototype;

    proto.create = function() {
        this._page = new ItemDetail(this.$el);
        this._page.create();
    }
    proto.destroy = function() {
        this._page && this._page.destroy();
    }

    return Root;
})();

// 이제부터 PageTurner는 이제 추상클래스가 아니라, 원본 컴포넌트의 역할을 보조해주는 독립적인 객체이다
const PageTurner = (() => {
    const PageTurner = function($loading, $more) {
        this.$loading = $loading;
        this.$more = $more;
    }
    const proto = PageTurner.prototype;

    proto.more = async function(ajaxMore) {
        this.beforeMore();
        const hasNext = await ajaxMore();
        this.afterMore(hasNext);
    }
    proto.beforeMore = function() {
        this.$more.style.display = 'none';
        this.$loading.style.display = '';
    }
    proto.afterMore = function(hasNext) {
        this.$loading.style.display = 'none';
        if(hasNext) {
            this.$more.style.display = '';
        }
    }

    return PageTurner;
})();

const AutoPageTurner = (() => {
    const AutoPageTurner = function($loading, $more) {
        PageTurner.call(this, $loading, $more);
    }
    AutoPageTurner.prototype = Object.create(PageTurner.prototype);
    AutoPageTurner.prototype.constructor = AutoPageTurner;
    const proto = AutoPageTurner.prototype;

    // PageTurner의 more 메소드가 오버라이드 됨
    proto.more = function(ajaxMore) {
        this.beforeMore();
        const io = new IntersectionObserver((entryList, observer) => {
            entryList.forEach(async entry => {
                if(!entry.isIntersecting) {
                    return;
                }
                const hasNext = await ajaxMore();
                if(!hasNext) {
                    observer.unobserve(entry.target);
                    this.afterMore(hasNext);
                }
            });
        }, { rootMargin: innerHeight + 'px' });
        io.observe(this.$loading);
    }

    return AutoPageTurner;
})();

const ItemDetail = (() => {
    const URL = 'https://my-json-server.typicode.com/it-crafts/lesson/detail/';

    const ItemDetail = function($parent) {
        this.$parent = $parent;
        this.render();
        this.$el = $parent.firstElementChild;
        this.$loading = this.$el.querySelector('.js-loading');
        this.$more = this.$el.querySelector('.js-more');

        this._item;
        this._detail;
        this._pageTurner;

        this._data = {};

        this.$click;
    }
    const proto = ItemDetail.prototype;

    proto.create = async function() {
        const detailData = await this.fetch();
        this._item = new Item(this.$el.firstElementChild, detailData, detailData.imgList, detailData.profile);
        this._item.create();
        this._detail = new Detail(this.$el.firstElementChild, detailData.detailList);
        this._detail.create();
        // ItemDetail이 PageTurner를 상속하는 게 아닌, 내부에 부하로 생성하고 일을 대신 시키기만 한다 (악보랑 악보대를 알려준다)
        this._pageTurner = new PageTurner(this.$loading, this.$more);
        this.addEvent();
    }
    proto.destroy = function() {
        this._item && this._item.destroy();
        this._detail && this._detail.destroy();
        this.removeEvent();
        this.$parent.removeChild(this.$el);
    }

    proto.click = function(e) {
        const listener = e.target.dataset.listener;
        if(listener === 'infinite') {
            // 런타임 부모 강제변경 - 이런 행위는 JS에서만 가능하며, 바람직하진 않으나 강력하다
            Object.setPrototypeOf(this._pageTurner, AutoPageTurner.prototype);
        }

        // 부하인 PageTurner 객체에게 "이거해" 라고 콜백을 넘겨준다 - 그럼 콜백 앞뒤의 일은 PageTurner가 알아서 한다
        this._pageTurner.more(async () => {
            const { hasNext } = await this._detail.addImg();
            return hasNext;
        });
    }

    proto.addEvent = function() {
        this.$click = this.click.bind(this);
        this.$more.addEventListener('click', this.$click);
    }
    proto.removeEvent = function() {
        this.$more.removeEventListener('click', this.$click);
    }

    proto.fetch = async function() {
        const detailData = await common.fetchApiData(URL, 1);
        Object.assign(this._data, detailData);
        return detailData;
    }

    proto.render = function() {
        this.$parent.innerHTML = `
            <div class="_2z6nI">
                <div style="flex-direction: column;">
                </div>
                <div class="js-more Igw0E rBNOH YBx95 ybXk5 _4EzTm soMvl" style="margin-right: 8px;">
                    <button data-listener="more" class="sqdOP L3NKy y3zKF _4pI4F" type="button" style="margin: 16px 8px">더보기</button>
                    <button data-listener="infinite" class="sqdOP L3NKy y3zKF _4pI4F" type="button" style="margin: 16px 8px">전체보기</button>
                </div>
                <div class="js-loading _4emnV" style="display: none;">
                    <div class="Igw0E IwRSH YBx95 _4EzTm _9qQ0O ZUqME" style="height: 32px; width: 32px;"><svg aria-label="읽어들이는 중..." class="By4nA" viewBox="0 0 100 100"><rect fill="#555555" height="6" opacity="0" rx="3" ry="3" transform="rotate(-90 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.08333333333333333" rx="3" ry="3" transform="rotate(-60 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.16666666666666666" rx="3" ry="3" transform="rotate(-30 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.25" rx="3" ry="3" transform="rotate(0 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.3333333333333333" rx="3" ry="3" transform="rotate(30 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.4166666666666667" rx="3" ry="3" transform="rotate(60 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.5" rx="3" ry="3" transform="rotate(90 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.5833333333333334" rx="3" ry="3" transform="rotate(120 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.6666666666666666" rx="3" ry="3" transform="rotate(150 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.75" rx="3" ry="3" transform="rotate(180 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.8333333333333334" rx="3" ry="3" transform="rotate(210 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.9166666666666666" rx="3" ry="3" transform="rotate(240 50 50)" width="25" x="72" y="47"></rect></svg></div>
                </div>
            </div>
        `;
    }

    return ItemDetail;
})();

const BasicSlider = (() => {
    const BasicSlider = function($parent, imgDataList = []){
        this._dataList = imgDataList;
        /* FIXME 부모 엘리먼트에 특정 클래스를 넣어두고, 자식 내부에서 부모를 직접 룩업하고 있습니다
        부모 컴포넌트와 강하게 결합되어 있어, 로직만 복잡해지고 모듈로 쪼개는 의미가 많이 없습니다
        BasicSlider가 자식 컴포넌트라면 애초에 부모에 있는 해당 템플릿까지 다 끌고와야 할 것 같고,
        로직을 보조하는 객체라면, 구체적인 부모의 구조를 알지 않고도 독립적으로 동작할 수 있게 해주세요 */
        this.$slider = $parent.querySelector('.js-slider');
        this.$sliderList = $parent.querySelector('ul');
        this.$left = $parent.querySelector('.js-left');
        this.$right = $parent.querySelector('.js-right');
        this.$pagebar = $parent.querySelector('.js-pagebar');

        this._imgCurIdx = 0;
        this._END_OF_IMG_LIST = this._dataList.length - 1;
        this._START_OF_IMG_LIST = 0;
        this._sliderWidth = innerWidth;
        
        /* TODO DOM에 대한 show/hide 처리는 생성자의 역할을 벗어나는 로직 같습니다
        아무리 간단한 코드라도, 비즈니스 로직은 별도의 메소드로 분리 해주세요
        moveRight와 moveLeft에 있는 첫줄/마지막줄도 끌어다가 한 메소드로 공통화도 가능할 것 같습니다 */
        this.$left.style.display = 'none';
        if(this._dataList.length === 1){
            this.$right.style.display = 'none';
        }
    }

    const proto = BasicSlider.prototype;
    
    /* FIXME moveRight와 moveLeft의 로직은 대부분 공통화가 가능할 것 같습니다
    고도화시 내부로직의 수정이 필요할 경우, 동일한 코드를 여러 번 수정해야 한다는 건 알 수 없습니다
    이런 코드가 쌓이고 쌓이면, 뭐 하나 수정하기 무섭고 어디에서 터질지 모르는 불안정한 코드가 됩니다
    반복로직은 유지보수 관점에서 항상 공통화 해주시면 좋을 것 같습니다 */
    proto.moveRight = function(){
        this.$left.style.display = '';
    
        const nextImgIdx = this._imgCurIdx + 1;
        this.$slider.style.transform = `translateX(-${this._sliderWidth*nextImgIdx}px)`;
        this.movePageBar(this._imgCurIdx, nextImgIdx);
        this._imgCurIdx = nextImgIdx;
        
        /* TODO 로직 한줄쓰기는 지양 해주시고, 의미있는 로직은 반드시 { 중괄호 }로 묶어주세요 */
        if(this._imgCurIdx === this._END_OF_IMG_LIST) this.$right.style.display = 'none';    
    }
    proto.moveLeft = function(){
        this.$right.style.display = '';
        
        const nextImgIdx = this._imgCurIdx - 1;
        this.$slider.style.transform = `translateX(-${this._sliderWidth*nextImgIdx}px)`;   
        this.movePageBar(this._imgCurIdx, nextImgIdx);
        this._imgCurIdx = nextImgIdx;
        
        if(this._imgCurIdx === this._START_OF_IMG_LIST) this.$left.style.display = 'none'; 
    }
    /* TODO DOM에 대한 스트링 연산은 성능 상으로 불리하고, 버그도 발생하기 쉽습니다
    명시적으로 classList 같은 API를 사용하는 게 조금 더 바람직할 것 같습니다
    마침 아래 movePageBar 호출시에 BUG 발생했으니, 확인해보시면 좋을 것 같아요! */
    proto.movePageBar = function(prevIdx, nextIdx){
        const prevPage = this.$pagebar.children[prevIdx];
        prevPage.className = prevPage.className.replace(/\s+?XCodT/,'');

        const nextPage = this.$pagebar.children[nextIdx];
        nextPage.className = nextPage.className + ' XCodT';
    }
    proto.resize = function() {
        while(this.$sliderList.firstChild) {
            this.$sliderList.removeChild(this.$sliderList.firstChild);
        }
        this.$sliderList.insertAdjacentHTML('beforeend', `
            ${BasicSlider.htmlSliderImgs(this._dataList)}
        `);
        this._sliderWidth = innerWidth;
        const sliderStyle = this.$slider.style;
        /* TODO 리사이즈 동작이 깔끔하다 했더니 이런 처리를 해두셨네요 (잘 하셨어요!)
        강제지연이 필요했던 것 같은데, 최소지연(0 또는 생략)을 줘도 동작하니 참고 해주세요! */
        sliderStyle.transitionDuration = '';
        sliderStyle.transform = `translateX(-${this._sliderWidth*(this._imgCurIdx)}px)`;
        /* FIXME 메소드에 더미 파라미터를 꽂기 보다는, 메소드 자체를 리팩토링하는 게 바람직합니다
        현재는 리사이즈시에 필요한 로직이 아니라서, 그냥 아래 라인을 지우면 될 것 같습니다 */
        /* BUG 리사이즈시, 해당 시점의 페이지바 dot이 고정되는 버그가 있습니다
        On클래스(XCodT)가 하나씩 추가로 계속 붙고 있습니다
        우선 아래 라인만 제거하면 해결될 것 같고, movePageBar 자체에 붙인 코맨트도 참조 해주세요 */
        this.movePageBar(0, this._imgCurIdx);
        setTimeout(() => {
            sliderStyle.transitionDuration = '0.25s';
        });
    }
    proto.addSliderEvent = function() {
        /* FIXME 아래 이벤트는 어차피 컴포넌트에서 생성한 DOM 엘리먼트에 직접 걸리는 이벤트이고
        destroy와 함께 DOM트리에서 제거하므로, 눈에 보이는 문제는 없어 보입니다
        하지만 실제로 리스너가 제거되지 않기 때문에, SPA 환경에서 메모리누수가 쌓일 수 있습니다
        이벤트리스너는 가능하면 안전하게 명시적으로 해제하는 편이 좋습니다
        관련해서 이 글 읽어보시면 도움될 것 같습니다
        https://ui.toast.com/weekly-pick/ko_20160826/
        https://v8.dev/blog/tracing-js-dom */
        this.$rightClick = this.moveRight.bind(this);
        this.$right.addEventListener('click', this.$rightClick);

        this.$leftClick = this.moveLeft.bind(this);
        this.$left.addEventListener('click', this.$leftClick);

        /* BUG destroy 시에 this.$resize 이벤트리스너가 제거되지 않아 메모리 누수가 쌓이고 있습니다
        root.destroy() 후 리사이즈 이벤트 발생시켜 보시면, 전부 살아있는 것 확인하실 수 있습니다
        컴포넌트에서 추가되는 모든 추가로직은 대응되는 제거로직을 작성 해주시고,
        destroy에서는 추가된 모든 것들을 제거하는 로직을 붙여주세요 */
        this.$resize = this.resize.bind(this);
        window.addEventListener('resize', this.$resize);
    }
    return BasicSlider;

})();

/* FIXME 스태틱 메소드로 바람직하지 않은 로직 같습니다!
Item으로 땡겨가거나 BasicSlider로 땡겨가주세요
위에 남겨드린 코맨트에 대한 리팩토링이 끝나면 자연스럽게 방향이 정해집니다 */
BasicSlider.htmlSliderImgs = function(imgDataList) {
    const imgs = imgDataList.reduce((html, img) => {
        html += `
            <li class="_-1_m6" style="opacity: 1; width: ${innerWidth}px;">
                <div class="bsGjF" style="margin-left: 0px; width: ${innerWidth}px;">
                    <div class="Igw0E IwRSH eGOV_ _4EzTm" style="width: ${innerWidth}px;">
                        <div role="button" tabindex="0" class="ZyFrc">
                            <div class="eLAPa RzuR0">
                                <div class="KL4Bh" style="padding-bottom: 100%;">
                                    <img class="FFVAD" decoding="auto" src="${common.IMG_PATH}${img}" style="width: ${innerWidth}px; object-fit: cover;">
                                </div>
                                <div class="_9AhH0"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        `;
        return html;
    }, '');
    return imgs;
}

const Item = (() => {
    const Item = function($parent, detailData = {}, imgDataList = [], profileData = {}) {
        this.$parent = $parent;
        this._dataList = imgDataList;
        this.render(detailData, profileData);
        this.$el = this.$parent.firstElementChild;
        
        this._slider = new BasicSlider(this.$el, imgDataList);
        this._slider.addSliderEvent();
    }
    const proto = Item.prototype;

    proto.create = function() {
    }
    proto.destroy = function() {
        this.$parent.removeChild(this.$el);
    }

    proto.render = function(data, profileData) {
        const navs = this._dataList.reduce((html, img, index) => {
            const on = index === 0 ? 'XCodT' : '';
            html += `
                <div class="Yi5aA ${on}"></div>
            `;
            return html;
        }, '');
        this.$parent.insertAdjacentHTML('afterbegin', `
            <article class="QBXjJ M9sTE h0YNM SgTZ1 Tgarh">
                <header class="Ppjfr UE9AK wdOqh">
                    <div class="RR-M- h5uC0 mrq0Z" role="button" tabindex="0">
                        <canvas class="CfWVH" height="126" width="126" style="position: absolute; top: -5px; left: -5px; width: 42px; height: 42px;"></canvas>
                        <span class="_2dbep" role="link" tabindex="0" style="width: 32px; height: 32px;"><img alt="${profileData.name}님의 프로필 사진" class="_6q-tv" src="${common.IMG_PATH}${profileData.img}"></span>
                    </div>
                    <div class="o-MQd">
                        <div class="e1e1d">
                            <h2 class="BrX75"><a class="FPmhX notranslate nJAzx" title="${profileData.name}" href="javascript:;">${profileData.name}</a></h2>
                        </div>
                    </div>
                </header>
                <div class="_97aPb wKWK0">
                    <div class="rQDP3">
                        <div class="pR7Pc">
                            <div class="tR2pe" style="padding-bottom: 100%;"></div>
                            <div class="Igw0E IwRSH eGOV_ _4EzTm O1flK D8xaz fm1AK TxciK yiMZG">
                                <div class="tN4sQ zRsZI">
                                    <div class="NgKI_">
                                        <div class="js-slider MreMs" tabindex="0" style="transition-duration: 0.25s; transform: translateX(0px);">
                                            <div class="qqm6D">
                                                <ul class="YlNGR" style="padding-left: 0px; padding-right: 0px;">
                                                    ${BasicSlider.htmlSliderImgs(this._dataList)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="js-left POSa_" tabindex="-1">
                                        <div class="coreSpriteLeftChevron"></div>
                                    </button>
                                    <button class="js-right _6CZji" tabindex="-1">
                                        <div class="coreSpriteRightChevron"></div>
                                    </button>
                                </div>
                            </div>
                            <div class="js-pagebar ijCUd _3eoV- IjCL9 _19dxx">
                                ${navs}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="eo2As">
                    <section class="ltpMr Slqrh">
                        <span class="fr66n"><button class="dCJp8 afkep"><span aria-label="좋아요" class="glyphsSpriteHeart__outline__24__grey_9 u-__7"></span></button></span>
                        <span class="_15y0l"><button class="dCJp8 afkep"><span aria-label="댓글 달기" class="glyphsSpriteComment__outline__24__grey_9 u-__7"></span></button></span>
                        <span class="_5e4p"><button class="dCJp8 afkep"><span aria-label="게시물 공유" class="glyphsSpriteDirect__outline__24__grey_9 u-__7"></span></button></span>
                        <span class="wmtNn"><button class="dCJp8 afkep"><span aria-label="저장" class="glyphsSpriteSave__outline__24__grey_9 u-__7"></span></button></span>
                    </section>
                    <section class="EDfFK ygqzn">
                        <div class=" Igw0E IwRSH eGOV_ ybXk5 vwCYk">
                            <div class="Nm9Fw"><a class="zV_Nj" href="javascript:;">좋아요 <span>${data.clipCount}</span>개</a></div>
                        </div>
                    </section>
                    <div class="KlCQn EtaWk">
                        <ul class="k59kT">
                            <div role="button" class="ZyFrc">
                                <li class="gElp9" role="menuitem">
                                    <div class="P9YgZ">
                                        <div class="C7I1f X7jCj">
                                            <div class="C4VMK">
                                                <h2 class="_6lAjh"><a class="FPmhX notranslate TlrDj" title="${profileData.name}" href="javascript:;">${profileData.name}</a></h2>
                                                <span>${data.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </div>
                            <li class="lnrre">
                                <button class="Z4IfV sqdOP yWX7d y3zKF" type="button">댓글 <span>${data.commentCount}</span>개 모두 보기</button>
                            </li>
                        </ul>
                    </div>
                    <section class="sH9wk _JgwE eJg28">
                        <div class="RxpZH"></div>
                    </section>
                </div>
                <div class="MEAGs">
                    <button class="dCJp8 afkep"><span aria-label="옵션 더 보기" class="glyphsSpriteMore_horizontal__outline__24__grey_9 u-__7"></span></button>
                </div>
            </article>
        `);
    }

    return Item;
})();

const Detail = (() => {
    const Detail = function($parent, detailDataList = []) {
        this.$parent = $parent;
        this._dataListTemp = detailDataList;
        this.$elList = [];
        this._dataList = [];
    };
    const proto = Detail.prototype;

    proto.create = function() {
    }
    proto.destroy = function() {
        this.$elList.forEach($el => this.$parent.removeChild($el));
    }

    proto.addImg = function() {
        return new Promise(resolve => {
            const detailData = this._dataListTemp.shift();
            if(!detailData) {
                resolve({ hasNext: false });
            }

            this.render(detailData);
            const $el = this.$parent.lastElementChild;
            this.$elList.push($el);
            this._dataList.push(detailData);

            $el.querySelector('img').onload = (e) => {
                resolve({ hasNext: this._dataListTemp.length > 0 });
            }
        });
    }

    proto.render = function(img) {
        this.$parent.insertAdjacentHTML('beforeend', `
            <article class="M9sTE h0YNM SgTZ1">
                <img style="width: 100%; height: auto;" src="${common.IMG_PATH}${img}">
            </article>
        `);
    }

    return Detail;
})();

const root = new Root('main');
root.create();