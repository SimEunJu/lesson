/**
 * Copyrightⓒ2020 by Moon Hanju (github.com/it-crafts)
 * All rights reserved. 무단전재 및 재배포 금지.
 * All contents cannot be copied without permission.
 */
const common = (() => {
    const IMG_PATH = 'https://it-crafts.github.io/lesson/img';
    const fetchApiData = async (url, page = 'info') => {
        const res = await fetch(url + page);
        const data = await res.json();
        return data.data;
    }

    return { IMG_PATH, fetchApiData }
})();

const Root = (selector) => {
    let $el;
    let $page;

    const create = () => {
        $el = document.querySelector(selector);
        $page = Timeline($el);
        $page.create();
    }

    const destroy = () => {
        $page && $page.destroy();
    }

    return { $el, create, destroy }
};

const Timeline = ($parent) => {
    const URL = 'https://my-json-server.typicode.com/it-crafts/lesson/timeline/';
    let $el;
    let $profile;
    let $content;

    const create = async () => {
        render();
        $el = $parent.firstElementChild;
        const [ totalPage, profileData ] = await fetch();
        $profile = TimelineProfile($el, profileData);
        $profile.create();
        $content = TimelineContent($el, URL, profileData, totalPage);
        $content.create();
    }

    const destroy = () => {
        $profile && $profile.destroy();
        $content && $content.destroy();
        $parent.removeChild($el);
    }

    const fetch = async () => {
        const infoData = await common.fetchApiData(URL);
        const totalPage = infoData.totalPage * 1;
        const profileData = infoData.profile;
        return [ totalPage, profileData ];
    }

    const render = () => {
        $parent.innerHTML = `
            <div class="v9tJq">
                <div class="fx7hk">
                    <a class="_9VEo1 T-jvg" href="javascript:;" data-type="grid"><span aria-label="게시물" class="glyphsSpritePhoto_grid__outline__24__grey_5 u-__7"></span></a>
                    <a class="_9VEo1" href="javascript:;" data-type="feed"><span aria-label="피드" class="glyphsSpritePhoto_list__outline__24__blue_5 u-__7"></span></a>
                    <a class="_9VEo1" href="javascript:;" data-type=""><span aria-label="태그됨" class="glyphsSpriteTag_up__outline__24__grey_5 u-__7"></span></a>
                </div>
            </div>
        `;
    }

    return { $el, create, destroy }
};

const TimelineProfile = ($parent, profileData = {}) => {
    let $el;

    const create = () => {
        render(profileData);
        $el = $parent.firstElementChild;
    }

    const destroy = () => {
        $parent.removeChild($el);
    }

    const scaleDown = numstring => {
        const num = numstring.replace(/,/g, '');
        if(num >= 1000000) {
            return Math.floor(num / 100000) / 10 + '백만'
        }
        if(num >= 1000) {
            return Math.floor(num / 100) / 10 + '천'
        }
        return num;
    };

    const render = (data) => {
        $parent.insertAdjacentHTML('afterbegin', `
            <div>
                <header class="HVbuG">
                    <div class="XjzKX">
                        <div class="RR-M- h5uC0" role="button" tabindex="0">
                            <canvas class="CfWVH" height="91" width="91" style="position: absolute; top: -7px; left: -7px; width: 91px; height: 91px;"></canvas>
                            <span class="_2dbep" role="link" tabindex="0" style="width: 77px; height: 77px;"><img alt="${data.name}님의 프로필 사진" class="_6q-tv" src="${common.IMG_PATH}${data.img}"></span>
                        </div>
                    </div>
                    <section class="zwlfE">
                        <div class="nZSzR">
                            <h1 class="_7UhW9 fKFbl yUEEX KV-D4 fDxYl">${data.name}</h1>
                            <span class="mrEK_ Szr5J coreSpriteVerifiedBadge" title="인증됨">인증됨</span>
                            <div class="AFWDX"><button class="dCJp8 afkep"><span aria-label="옵션" class="glyphsSpriteMore_horizontal__outline__24__grey_9 u-__7"></span></button></div>
                        </div>
                        <div class="Y2E37">
                            <div class="Igw0E IwRSH eGOV_ vwCYk">
                                <span class="ffKix bqE32">
                                    <span class="vBF20 _1OSdk"><button class="_5f5mN jIbKX _6VtSN yZn4P">팔로우</button></span>
                                    <span class="mLCHD _1OSdk"><button class="_5f5mN jIbKX KUBKM yZn4P"><div class="OfoBO"><div class="_5fEvj coreSpriteDropdownArrowWhite"></div></div></button></span>
                                </span>
                            </div>
                        </div>
                    </section>
                </header>
                <div class="-vDIg">
                    <h1 class="rhpdm">${data.title}</h1><br><span>${data.text}</span>
                </div>
                <ul class="_3dEHb">
                    <li class="LH36I"><span class="_81NM2">게시물 <span class="g47SY lOXF2">${data.post}</span></span></li>
                    <li class="LH36I"><a class="_81NM2" href="javascript:;">팔로워 <span class="g47SY lOXF2" title="${data.follower}">${scaleDown(data.follower)}</span></a></li>
                    <li class="LH36I"><a class="_81NM2" href="javascript:;">팔로우 <span class="g47SY lOXF2">${data.follow}</span></a></li>
                </ul>
            </div>
        `);
    }

    return { $el, create, destroy }
};

const TimelineContent = ($parent, url = '', profileData = {}, totalPage = 1) => {
    let $el;
    let $feed;

    let page = 0;
    const dataList = [];

    const create = async () => {
        render();
        $el = $parent.lastElementChild;
        const pageDataList = await fetch();
        $feed = Feed($el.firstElementChild, profileData, pageDataList);
        $feed.create();
        initInfiniteScroll();
    }

    const destroy = () => {
        $feed && $feed.destroy();
        $parent.removeChild($el);
    }

    const fetch = async () => {
        const pageDataList = await common.fetchApiData(url, ++page);
        dataList.push(pageDataList);
        return pageDataList;
    }

    const initInfiniteScroll = () => {
        const $loading = $el.lastElementChild;
        const io = new IntersectionObserver((entryList, observer) => {
            entryList.forEach(async entry => {
                if(!entry.isIntersecting) { return; }
                await ajaxMore();
                if(page >= totalPage) {
                    observer.unobserve(entry.target);
                    $loading.style.display = 'none';
                }
            });
        }, { rootMargin: innerHeight + 'px' });
        io.observe($loading);
    }

    const ajaxMore = async () => {
        const pageDataList = await fetch();
        $feed && $feed.addFeedItems(profileData, pageDataList);
    }

    const render = () => {
        $parent.insertAdjacentHTML('beforeend', `
            <div class="_2z6nI">
                <div style="flex-direction: column;">
                </div>
                <div class="_4emnV">
                    <div class="Igw0E IwRSH YBx95 _4EzTm _9qQ0O ZUqME" style="height: 32px; width: 32px;"><svg aria-label="읽어들이는 중..." class="By4nA" viewBox="0 0 100 100"><rect fill="#555555" height="6" opacity="0" rx="3" ry="3" transform="rotate(-90 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.08333333333333333" rx="3" ry="3" transform="rotate(-60 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.16666666666666666" rx="3" ry="3" transform="rotate(-30 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.25" rx="3" ry="3" transform="rotate(0 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.3333333333333333" rx="3" ry="3" transform="rotate(30 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.4166666666666667" rx="3" ry="3" transform="rotate(60 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.5" rx="3" ry="3" transform="rotate(90 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.5833333333333334" rx="3" ry="3" transform="rotate(120 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.6666666666666666" rx="3" ry="3" transform="rotate(150 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.75" rx="3" ry="3" transform="rotate(180 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.8333333333333334" rx="3" ry="3" transform="rotate(210 50 50)" width="25" x="72" y="47"></rect><rect fill="#555555" height="6" opacity="0.9166666666666666" rx="3" ry="3" transform="rotate(240 50 50)" width="25" x="72" y="47"></rect></svg></div>
                </div>
            </div>
        `);
    }

    return { $el, create, destroy }
};

// TODO 뷰 역할인 Feed 컴포넌트에 이미지 레이지로드 기능 추가 - initInfiniteScroll 히스토리 참고
const Feed = ($parent, profileData = {}, pageDataList = []) => {
    const $elList = [];

    const create = () => {
        addFeedItems(profileData, pageDataList);
    }

    const destroy = () => {
        $elList.forEach($el => $parent.removeChild($el));
    }

    const addFeedItems = (profileData = {}, pageDataList = []) => {
        const firstIndex = $parent.children.length;
        render(profileData, pageDataList);
        
        /* COMMENT 디버깅 꼼꼼히 안 해봤으면 발견 못 하셨을텐데, 정말 잘 하셨습니다 */
        const newlyAddedList = [].slice.call($parent.children, firstIndex);
        $elList.push(...newlyAddedList);

        lazyLoadImg(newlyAddedList);
    }

    const lazyLoadImg = (newlyAddedList = []) => {
        /* TODO 현재는 페이지수 만큼 io객체가 생성되고 있습니다, 만약 10페이지, 100페이지, ... 가 있다면 그 만큼 생성됩니다
        로직상 Feed는 List를 담는 컴포넌트이기 때문에, 사실 io는 하나만 있으면 충분합니다
        io 생성은 컴포넌트 레벨로 올리고, observe하는 로직만 반복되면 성능이 개선될 수 있을 것 같습니다 */
        const io = new IntersectionObserver((entryList, observer) => {
            entryList.forEach(entry => {
                if(!entry.isIntersecting) { return; }
                /* COMMENT 스타일에 사용된 class는 컴포넌트 로직에서 사용이 바람직하지 못합니다 (잘하셨어요)
                다만, 현재 추가된 class의 컨벤션이 추후 언젠가 추가될 스타일과 충돌할 여지가 있습니다
                (참고로 NHN에서는, 꼭 필요할 경우 js-classname 같은 이름의 class를 권장합니다)
                만약 제가 했다면 img[data-src] 정도로 썼을 것 같은데, 여기부터는 취향이라 참고만 해주세요 */
                const $img = entry.target.querySelector(".main_img");
                $img.src = $img.dataset.src;
                delete $img.dataset.src;
                observer.unobserve(entry.target);
            }, {rootMargin : '100px'});
        });
        newlyAddedList.forEach($feed => io.observe($feed));
    }
 
    const render = (profileData, pageDataList) => {
        const html = pageDataList.reduce((html, data) => {
            html += `
                <article class="M9sTE h0YNM SgTZ1">
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
                    <div class="_97aPb">
                        <div role="button" tabindex="0" class="ZyFrc">
                            <div class="eLAPa kPFhm">
                                <div class="KL4Bh" style="padding-bottom: 100%;"><img class="FFVAD" alt="${data.name}" src="${common.IMG_PATH}/lazy${data.img}" data-src="${common.IMG_PATH}${data.img}" style="object-fit: cover;"></div>
                                <div class="_9AhH0"></div>
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
            `;
            return html;
        }, '');
        $parent.insertAdjacentHTML('beforeend', html);
    }

    return { $elList, create, destroy, addFeedItems }
};

const root = Root('main');
root.create();
// root.destroy();
// root.create();