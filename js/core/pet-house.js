'use strict';

function freshPetStats() { return { aff: 0, hunger: 76, mood: 84, energy: 72, pets: 0 }; }
function freshPetHouse() {
    return { version: 1, selected: 'orange', cats: Object.fromEntries(PET_DEFS.filter(p => p.id !== 'orange').map(p => [p.id, { name: p.name, created: Date.now(), ...freshPetStats() }])) };
}
function cleanPetHouse(raw) {
    if (raw?.version !== undefined && raw.version !== 1) throw Error('猫咪小屋版本不支持');
    const house = freshPetHouse();
    if (PET_DEFS.some(p => p.id === raw?.selected)) house.selected = raw.selected;
    for (const pet of PET_DEFS.filter(p => p.id !== 'orange')) {
        const source = raw?.cats?.[pet.id], target = house.cats[pet.id];
        if (typeof source?.name === 'string' && source.name.trim()) target.name = source.name.trim().slice(0, 10);
        if (Number.isFinite(source?.created)) target.created = clamp(Math.round(source.created), 946684800000, Date.now());
        for (const key of ['aff', 'hunger', 'mood', 'energy', 'pets'])
            if (Number.isFinite(source?.[key])) target[key] = clamp(Math.round(source[key]), 0, key === 'pets' ? 99999999 : key === 'aff' ? 99999 : 100);
    }
    return house;
}
function petHouse(source = state) { return source.petHouse || (source.petHouse = freshPetHouse()); }
function selectedPetDef(source = state) { return PET_DEFS.find(p => p.id === petHouse(source).selected) || PET_DEFS[0]; }
function petStats(id = selectedPetDef().id, source = state) { return id === 'orange' ? source.cat : petHouse(source).cats[id]; }
function petName(id = selectedPetDef().id, source = state) { return id === 'orange' ? source.catName : petStats(id, source).name; }
function petForBond(id) { return PET_DEFS.find(p => p.bondId === id); }
function sealPetBonds(source) {
    return { v: 1, values: Object.fromEntries(PET_DEFS.filter(p => p.id !== 'orange').map(p => [p.id, sealProtectedNumber(petStats(p.id, source).aff, 'bond:' + p.bondId)])) };
}
function restorePetBonds(source, raw) {
    // Explicit single-cat -> three-cat migration: initialize only new cats;
    // never copy the orange cat's bond, quota, name or collectibles to others.
    if (raw.petBondVault === undefined) {
        if (raw.wallet && raw.petHouse?.version === 1) throw Error('猫咪羁绊数据缺失');
        return;
    }
    if (raw.petBondVault?.v !== 1 || !raw.petBondVault.values) throw Error('猫咪羁绊数据校验失败');
    for (const pet of PET_DEFS.filter(p => p.id !== 'orange'))
        petStats(pet.id, source).aff = openProtectedNumber(raw.petBondVault.values[pet.id], 'bond:' + pet.bondId);
}
function selectPet(id) {
    if (!PET_DEFS.some(p => p.id === id)) return false;
    const house = petHouse(), before = house.selected;
    if (id === before) return true;
    if (!storageOK) { toast('存档保护中，暂时无法保存猫咪切换。'); return false; }
    house.selected = id;
    if (!save()) { house.selected = before; return false; }
    return true;
}
function renameSelectedPet(name) {
    const value = name.trim().slice(0, 10), id = selectedPetDef().id;
    if (!value || !storageOK) return false;
    const before = petName(id);
    if (id === 'orange') state.catName = value;
    else petStats(id).name = value;
    if (!save()) {
        if (id === 'orange') state.catName = before;
        else petStats(id).name = before;
        return false;
    }
    return true;
}
