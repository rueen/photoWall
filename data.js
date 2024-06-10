/*
 * @Author: diaochan
 * @Date: 2024-06-08 10:43:41
 * @LastEditors: diaochan
 * @LastEditTime: 2024-06-09 16:58:42
 * @Description: 
 */
const DATA = [{
  id: 1,
  name: 'rueen',
  avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 1, // 角色类型
  relatedIds: [2,3], // 关联ID
  describe: {
    title: '宇宙第一大美女',
    content: '<div>亮躬耕陇亩，好为《梁父吟》。身长八尺，每自比于管仲、乐毅，时人莫之许也。惟博陵崔州平、颍川徐庶元直与亮友善，谓为信然。时先主屯新野。徐庶见先主，先主器之，谓先主曰：“诸葛孔明者，卧龙也，将军岂愿见之乎？”先主曰：“君与俱来。”庶曰：“此人可就见，不可屈致也。将军宜枉驾顾之。由是先主遂诣亮，凡三往，乃见。因屏人曰：“汉室倾颓，奸臣窃命，主上蒙尘。孤不度德量力，欲信大义于天下，而智术浅短，遂用猖蹶，至于今日。然志犹未已，君谓计将安出？亮答曰：“自董卓已来，豪杰并起，跨州连郡者不可胜数。曹操比于袁绍，则名微而众寡，然操遂能克绍，以弱为强者，非惟天时，抑亦人谋也。今操已拥百万之众，挟天子而令诸侯，此诚不可与争锋。孙权据有江东，已历三世，国险而民附，贤能为之用，此可以为援而不可图也。荆州北据汉、沔，利尽南海，东连吴会，西通巴、蜀，此用武之国，而其主不能守，此殆天所以资将军，将军岂有意乎？益州险塞，沃野千里，天府之土，高祖因之以成帝业。刘璋暗弱，张鲁在北，民殷国富而不知存恤，智能之士思得明君。将军既帝室之胄，信义著于四海，总揽英雄，思贤如渴，若跨有荆、益，保其岩阻，西和诸戎，南抚夷越，外结好孙权，内修政理；天下有变，则命一上将将荆州之军以向宛、洛，将军身率益州之众出于秦川，百姓孰敢不箪食壶浆以迎将军者乎？诚如是，则霸业可成，汉室可兴矣。”先主曰：“善！”于是与亮情好日密。关羽、张飞等不悦，先主解之曰：“孤之有孔明，犹鱼之有水也。愿诸君勿复言。”羽、飞乃止。</div>'
  }
},{
  id: 2,
  name: '2',
  avatar: 'https://images.pexels.com/photos/25252688/pexels-photo-25252688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 2,
  relatedIds: [1,3,9],
  describe: {
    title: '宇宙第一大美女',
    content: '<div>蜀道难 难于上青天</div>'
  }
},{
  id: 3,
  name: '3',
  avatar: 'https://images.pexels.com/photos/25003298/pexels-photo-25003298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 3,
  relatedIds: [1,2],
  describe: {
    title: '宇宙第一大美女',
    content: '<div>蜀道难 难于上青天</div>'
  }
},{
  id: 4,
  name: '4',
  avatar: 'https://images.pexels.com/photos/25002962/pexels-photo-25002962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 1,
  relatedIds: [2,6]
},{
  id: 5,
  name: '5',
  avatar: 'https://images.pexels.com/photos/25232982/pexels-photo-25232982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 2,
  relatedIds: [8,9]
},{
  id: 6,
  name: '6',
  avatar: 'https://images.pexels.com/photos/25242264/pexels-photo-25242264.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 3,
  relatedIds: [2,10]
},{
  id: 7,
  name: '7',
  avatar: 'https://images.pexels.com/photos/25205085/pexels-photo-25205085.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 1,
  relatedIds: [3,4]
},{
  id: 8,
  name: '8',
  avatar: 'https://images.pexels.com/photos/20532356/pexels-photo-20532356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 2,
  relatedIds: [2]
},{
  id: 9,
  name: '9',
  avatar: 'https://images.pexels.com/photos/25232980/pexels-photo-25232980.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 3,
  relatedIds: [5]
},{
  id: 10,
  name: '10',
  avatar: 'https://images.pexels.com/photos/25003282/pexels-photo-25003282.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  roleType: 3,
  relatedIds: [1,2,3]
}];

export default DATA;