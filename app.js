// 可以修改为自己微信名字
var userName = 'Licy';
$('.header .user-name').html(userName); 
// 朋友圈页面的数据
var data = [{
  user: {
    name: '阳和',
    avatar: './img/avatar2.png'
  }, 
  content: {
    type: 0, // 多图片消息
    text: '华仔真棒，新的一年继续努力！',
    pics: ['./img/reward1.png', './img/reward2.png', './img/reward3.png', './img/reward4.png'],
    share: {},
    timeString: '3分钟前',
  }, 
  reply: {
    hasLiked: false,
    likes: ['Guo封面', '源小神'],
    comments: [{
      author: 'Guo封面',
      text: '你也喜欢华仔哈！！！'
    },{
      author: '喵仔zsy',
      text: '华仔实至名归哈'
    }]
  }
}, {
  user: {
    name: '伟科大人',
    avatar: './img/avatar3.png'
  },
  content: {
    type: 1, // 分享消息
    text: '全面读书日',
    pics: [],
    share: {
      pic: 'http://coding.imweb.io/img/p3/transition-hover.jpg',
      text: '飘洋过海来看你'
    },
    timeString: '50分钟前',
  },
  reply: {
    hasLiked: false,
    likes: ['阳和'],
    comments: []
  }
}, {
  user: {
    name: '深圳周润发',
    avatar: './img/avatar4.png'
  },
  content: {
    type: 2, // 单图片消息
    text: '很好的色彩',
    pics: ['http://coding.imweb.io/img/default/k-2.jpg'],
    share: {},
    timeString: '一小时前'
  },
  reply: {
    hasLiked: false,
    likes:[],
    comments: []
  }
}, {
  user: {
    name: '喵仔zsy',
    avatar: './img/avatar5.png'
  },
  content: {
    type: 3, // 无图片消息
    text: '以后咖啡豆不敢浪费了',
    pics: [],
    share: {},
    timeString: '2个小时前',
  }, 
  reply: {
    hasLiked: false,
    likes:[],
    comments: []
  }
}];

// 相关 DOM
var $page = $('.page-moments');
var $momentsList = $('.moments-list');

// 当前消息对象
var curMessage = {
  index: -1, // 当前消息对象坐标
  reply: {}, // 当前回复消息数据
  $elem: null //  当前元素的jquery对象
};

/**
 * 点赞内容 HTML 模板
 * @param {Array} likes 点赞人列表
 * @return {String} 返回html字符串
 */
function likesHtmlTpl (likes) {
  if (!likes.length) {
    return '';
  }
  var  htmlText = ['<div class="reply-like"><i class="icon-like-blue"></i>'];
  if (likes.length) {
    htmlText.push(' <a class="reply-who" href="#">' + likes[0] + '</a>');
  }
  // 后面的前面都有逗号
  for(var i = 1, len = likes.length; i < len; i++) {
    htmlText.push('，<a class="reply-who" href="#">' + likes[i] + '</a>');
  }
  htmlText.push('</div>');
  return htmlText.join('');
}

/**
 * 评论内容 HTML 模板
 * @param {Array} comments 点赞人列表
 * @return {String} 返回html字符串
 */
function commentsHtmlTpl (comments) {
  if (!comments.length) {
    return '';
  }
  var  htmlText = ['<div class="reply-comment">'];
  for(var i = 0, len = comments.length; i < len; i++) {
    var comment = comments[i];
    htmlText.push('<div class="comment-item"><a class="reply-who" href="#">' + comment.author + '</a>：' + comment.text + '</div>');
  }
  htmlText.push('</div>');
  return htmlText.join('');
}

/**
 * 评论点赞总体内容 HTML 模板
 * @param {Object} replyData 消息的评论点赞数据
 * @return {String} 返回html字符串
 */
function replyTpl (replyData) {
  var htmlText = [];
  htmlText.push('<div class="reply-zone">');
  htmlText.push(likesHtmlTpl(replyData.likes));
  htmlText.push(commentsHtmlTpl(replyData.comments));
  htmlText.push('</div>');
  return htmlText.join('');
}

/**
 * 多张图片消息模版 （可参考message.html）
 * @param {Object} pics 多图片消息的图片列表
 * @return {String} 返回html字符串
 */
function multiplePicTpl (pics) {
  var htmlText = [];
  htmlText.push('<ul class="item-pic">');
  for (var i = 0, len = pics.length; i < len; i++) {
    htmlText.push('<img class="pic-item" src="' + pics[i] + '">')
  }
  htmlText.push('</ul>');
  return htmlText.join('');
}

/**
 * 单张图片消息模版 
 * @param {Object} pic 单图片消息的图片列表
 * @return {String} 返回html字符串
 */
function singlePicTpl (pic) {
  return '<div class="item-pic"><img class="single-pic-item pic-item" src="' + pic + '" alt=""></div>';
}

/**
 * 分消息模版 
 * @param {Object} share 分享消息对象
 * @return {String} 返回html字符串
 */
function shareMsgTpl (share) {
    var htmlText = [];
    htmlText.push('<a class="item-share">');
    htmlText.push('<img class="share-img" src="' + share.pic + '" width="40" height="40" alt="">')
    htmlText.push('<p class="share-tt">' + share.text + '</p>')
    htmlText.push('</a>');
    return htmlText.join('');
}

/**
 * 循环：消息体 
 * @param {Object} messageData 对象
 */ 
function messageTpl (messageData) {
  var user = messageData.user;
  var content = messageData.content;
  var htmlText = [];
  htmlText.push('<div class="moments-item" data-index="0">');
  // 消息用户头像
  htmlText.push('<a class="item-left" href="#">');
  htmlText.push('<img src="' + user.avatar + '" width="42" height="42" alt=""/>');
  htmlText.push('</a>');
  // 消息右边内容
  htmlText.push('<div class="item-right">');
  // 消息内容-用户名称
  htmlText.push('<a href="#" class="item-name">' + user.name + '</a>');
  // 消息内容-文本信息
  htmlText.push('<p class="item-msg">' + content.text + '</p>');
  // 消息内容-图片列表 （目前只支持多图片消息，需要补充完成其余三种消息展示）
  var contentHtml = '';
  switch(content.type) {
    // 多图片和无图片可共用
    case 0:
      contentHtml = multiplePicTpl(content.pics);
      break;
    // 分享消息
    case 1:
      contentHtml = shareMsgTpl(content.share);
      break;
    // 单图片
    case 2:
      contentHtml = singlePicTpl(content.pics[0]);
      break;
  }
  htmlText.push(contentHtml);
  // 消息时间和回复按钮
  htmlText.push('<div class="item-ft">');
  htmlText.push('<span class="item-time">' + content.timeString + '</span>');
  htmlText.push('<div class="item-reply-btn">');
  htmlText.push('<span class="item-reply"></span>');
  htmlText.push('</div></div>');
  // 消息回复模块（点赞和评论）
  htmlText.push(replyTpl(messageData.reply));
  htmlText.push('</div></div>');
  return htmlText.join('');
}

/**
 * 页面渲染函数：render
 */
function render () {
  // TODO: 目前只渲染了一个消息（多图片信息）,需要展示data数组中的所有消息数据。
  var messageHtml = '';
  data.forEach(function(message) {
    messageHtml += messageTpl(message);
  })
  $momentsList.html(messageHtml);
}

/**
 * 图片放大模块组件
 */
var enlargeImageModule = {
    // 初始化
    init: function () {
        // 获取图片放大组件元素
        this.$element = $('.enlarge-image');
        this.$image = this.$element.find('img');
    },
    /**
   * 放大指定放大图片，并展示图片放大组件
   * @param {String} imgSrc 需要展现的图片地址
   */
  show: function (imgSrc) {
      this.$image.attr('src', imgSrc);
      this.$element.addClass('z-show');
  },
  /**
   * 隐藏图片放大组件
   */
  hide: function () {
      this.$element.removeClass('z-show');
  }
};

/**
 * 回复面板模块
 * 负责处理点赞、取消点赞、评论的功能
 */
var replyPanelModule = {
    // 初始化元素
    init: function () {
        this.$element = $('.reply-panel');
        this.status = 'hide';
    },
    // 点赞处理
    doLike: function () {
        var replyData = curMessage.reply;
        // 更新数据
        replyData.hasLiked = true;
        replyData.likes.push(userName);
        this.updateCurMsgLikes();
        this.hide();
    },
    // 取消点赞处理
    doUnLike: function () {
        var replyData = curMessage.reply;
        var comments = replyData.comments;
        // 更新数据 - 去除我的名字
        var newLikes = replyData.likes.filter(function (like) {
            return like !== userName;
        });
        replyData.likes = newLikes;
        replyData.hasLiked = false;
        // 如果没有消息和评论后
        if (!newLikes.length && !comments.length) {
            curMessage.$elem.find('.reply-zone').remove();
        } else {
            this.updateCurMsgLikes();
        }
        this.hide();
    },
    // 评论处理
    doComment: function () {
        // 展现我们的评论
        this.hide();
        commentModule.show();
    },
    /**
     * 点击消息评论时判断
     * @param isSameMsg 是否当前展示的消息和点击展示的消息序号是一致
     */
    doReply: function (isSameMsg) {
        var self = this;
        var replyData = curMessage.reply;
        // 面板的容器元素
        var $panelContainer = curMessage.$elem.find('.item-ft');
        // 如果当前是隐藏的或者点击展示的是不同的的消息
        if (this.status === 'hide' || !isSameMsg) {
            // 如果消息已经点赞了则增加类名 z-liked
            replyData.hasLiked ? this.$element.addClass('z-liked') : this.$element.removeClass('z-liked');
            // 需要先隐藏
            this.$element.removeClass('z-show');  
            $panelContainer.append(this.$element);
            // 延迟展现动画效果
            setTimeout(function () {
                self.$element.addClass('z-show');
                self.status = 'show';
            }, 0);
        } else {
            this.hide();
        }
     },
     /**
      * 渲染点赞人区域
      */
     updateCurMsgLikes: function() {
         //生成新的html
         var htmlText = likesHtmlTpl(curMessage.reply.likes);
         //移除旧的节点
         curMessage.$elem.find('.reply-like').remove();
         //插入新的HTML节点
         curMessage.$elem.find('.reply-zone').prepend(htmlText);
     },
     /**
      * 隐藏回复功能面板
      */
     hide: function() {
         // 清空当前消息面板
         this.$element.removeClass('z-show');
         this.status = 'hide';
     }
};
/**
 * 增加评论组件模块
 * 负责管理增加评论的文本框和发送按钮
 */
var commentModule = {
    // 初始化元素
    init: function() {
        this.$element = $('.commenter');
        this.$input = this.$element.find('.commenter-input');
        this.$btn = this.$element.find('.js-send-msg');
    },
    // 增加评论
    doSend: function() {
        var text = this.$input.val();
        var replyData = curMessage.reply;
        // 如果可以点击
        if (this.$btn.hasClass('z-work')) {
            // 更新数据 - 增加评论
            replyData.comments.push({
                author: userName,
                text: text
            });
            // 生成新的html
            var htmlText = commentsHtmlTpl(curMessage.reply.comments);
            // 移除旧的节点
            curMessage.$elem.find('.reply-comment').remove();
           // 插入新的HTML节点
           curMessage.$elem.find('.reply-zone').append(htmlText);
           this.hide();
        }
     },
     /**
      * 展现函数，需要传入当前的message和对象
      */
     show: function() {
         this.$element.addClass('z-show');
         this.$input.focus();
     },
     // 隐藏评论模块
     hide: function() {
         this.$element.removeClass('z-show');
         // 清空文本框
         this.$input.val('');
         this.$btn.removeClass('z-work');
     },
};

/**
 * 页面绑定事件函数：bindEvent
 */
function bindEvent() {
  // 回复按钮点击
  $page.on('click', '.item-reply-btn', function(event) {
    var $item = $(this).parents('.moments-item');
    var curIndex = $item.index();

    // 判断是否是同一个消息
    var isSameMsg = curIndex === curMessage.index;

    // 更新当前信息对象
    curMessage.index = curIndex;
    curMessage.reply = data[curIndex].reply;
    curMessage.$elem = $item;

    // 执行回复面包的reply功能    
    replyPanelModule.doReply(isSameMsg);

    // 打开面板使需要隐藏评论框
    commentModule.hide();

     // 阻止冒泡
    event.stopPropagation();
  });

  // 点赞按钮功能
  $page.on('click', '.js-like', function() {
    replyPanelModule.doLike();
  });

  // 取消点赞按钮功能
  $page.on('click', '.js-unlike', function() {
    replyPanelModule.doUnLike();
  });

  // 评论按钮功能，会弹出评论框
  $page.on('click', '.js-comment', function(event) {
    replyPanelModule.doComment();
    // 阻止冒泡
    event.stopPropagation();
  });

  // 点击消息图片则展示放大
  $page.on('click', '.item-pic .pic-item', function() {
    // 获取图片地址
    var src = $(this).attr('src');
    enlargeImageModule.show(src);
  });

  // 输入框事件
  $page.on('input', '.commenter-input', function() {
    var textValue = $(this).val().trim();
    var $btn = $(this).siblings('.js-send-msg');
    // 如果输入框不为空，则展示按钮可点击，否则不可点击
    textValue !== '' ? $btn.addClass('z-work') : $btn.removeClass('z-work');
  });

  // 评论框比较特殊，如果是评论框点击，阻止冒泡不隐藏
  $page.on('click', '.commenter', function() {
    event.stopPropagation();
  });

  // 评论消息发送按钮
  $page.on('click', '.js-send-msg', function() {
    commentModule.doSend();
  });

  // 点击图片放大面板则隐藏
  $page.on('click', '.enlarge-image', function() {
    enlargeImageModule.hide();
  });
  
  // 由于回复面板和评论都会取消冒泡，因此触发页面click的不是这两个组件
  $(window).on('click', function(event) {
    replyPanelModule.hide();
    commentModule.hide();
  });
}

/**
 * 页面入口函数：init
 * 0、初始化各组件
 * 1、根据数据页面内容
 * 2、绑定事件
 */
function init() {
  // 初始化各功能模块
  enlargeImageModule.init();
  replyPanelModule.init();
  commentModule.init();
  // 渲染页面
  render();
  bindEvent();
}

init();