export default class Entity {
    id;
    x;
    y;
    size;
    name;
    isMine;
    isFood;
    isVirus;
    isFriend;
    constructor() {
        this.id = 0;
        this.x = 0;
        this.y = 0;
        this.size = 0;
        this.name = '';
        this.isMine = false;
        this.isFood = false;
        this.isVirus = false;
        this.isFriend = false;
    }
}
