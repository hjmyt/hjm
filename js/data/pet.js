'use strict';

// Three distinct pets. Orange retains the original cat's identity and save keys.
const PET_DEFS = Object.freeze([
    { id: 'orange', bondId: 'cat', pose: 'idle', asset: 'cat', name: '哈基米', label: '橘猫', purr: 'purr', photo: 'photo', trust: 'trust' },
    { id: 'white', bondId: 'catwhite', pose: 'rest', asset: 'catRest', name: '棉花糖', label: '白猫', purr: 'pet_white_purr', photo: 'pet_white_photo', trust: 'pet_white_trust' },
    { id: 'singer', bondId: 'catsinger', pose: 'music', asset: 'catMusic', name: '小主唱', label: '灰猫', purr: 'pet_singer_purr', photo: 'pet_singer_photo', trust: 'pet_singer_trust' }
]);
const PET_POSES = Object.freeze({
    idle: { asset: 'cat', label: '橘猫的小窝', caption: '奶白蝴蝶结，和一条偷偷打拍子的尾巴。', alt: '戴奶白蝴蝶结的橘色虎斑小猫' },
    rest: { asset: 'catRest', label: '白猫的趴趴时光', caption: '把爪爪收好，陪你慢慢放松。', alt: '趴着休息、翘起蓬松尾巴的白色小猫' },
    music: { asset: 'catMusic', label: '灰猫的主唱时间', caption: '戴上耳机，拿起麦克风，今天轮到我唱歌。', alt: '戴耳机和蓝色领带、手持麦克风唱歌的灰色虎斑小猫' }
});
