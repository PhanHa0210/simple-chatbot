<?php
/**
 * Plugin Name: WP Chatbot
 * Plugin URI: https://yourwebsite.com/wp-chatbot
 * Description: Chatbot tương tác với người dùng thông qua webhook n8n
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * Text Domain: wp-chatbot
 */

// Ngăn chặn truy cập trực tiếp
if (!defined('ABSPATH')) {
    exit;
}

// Định nghĩa hằng số plugin
define('WP_CHATBOT_VERSION', '1.0.0');
define('WP_CHATBOT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_CHATBOT_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include các file cần thiết
require_once WP_CHATBOT_PLUGIN_DIR . 'includes/admin-settings.php';

/**
 * Khởi tạo plugin
 */
function wp_chatbot_init() {
    // Đăng ký scripts và styles
    add_action('wp_enqueue_scripts', 'wp_chatbot_enqueue_scripts');
    
    // Thêm chatbot vào footer
    add_action('wp_footer', 'wp_chatbot_add_to_footer');
}
add_action('init', 'wp_chatbot_init');

/**
 * Đăng ký scripts và styles
 */
function wp_chatbot_enqueue_scripts() {
    // Đăng ký và enqueue CSS
    wp_register_style(
        'wp-chatbot-style',
        WP_CHATBOT_PLUGIN_URL . 'assets/css/chatbot.css',
        array(),
        WP_CHATBOT_VERSION
    );
    wp_enqueue_style('wp-chatbot-style');
    
    // Đăng ký và enqueue JavaScript
    wp_register_script(
        'wp-chatbot-script',
        WP_CHATBOT_PLUGIN_URL . 'assets/js/chatbot.js',
        array('jquery'),
        WP_CHATBOT_VERSION,
        true
    );
    
    // Truyền các biến từ PHP sang JavaScript
    $chatbot_settings = get_option('wp_chatbot_settings', array(
        'webhook_url' => 'https://0mixv0zt.repcl.net/webhook/timmau',
        'primary_color' => '#3b82f6',
        'welcome_message' => 'Bạn hãy đặt câu hỏi với bác sĩ tại đây nhé'
    ));
    
    wp_localize_script(
        'wp-chatbot-script',
        'wpChatbotSettings',
        array(
            'webhook_url' => $chatbot_settings['webhook_url'],
            'primary_color' => $chatbot_settings['primary_color'],
            'welcome_message' => $chatbot_settings['welcome_message'],
            'ajax_url' => admin_url('admin-ajax.php')
        )
    );
    
    wp_enqueue_script('wp-chatbot-script');
}

/**
 * Thêm chatbot vào footer của trang
 */
function wp_chatbot_add_to_footer() {
    ?>
    <div id="wp-chatbot-container"></div>
    <?php
}

/**
 * Kích hoạt plugin
 */
function wp_chatbot_activate() {
    // Khởi tạo các giá trị mặc định
    $default_settings = array(
        'webhook_url' => 'https://0mixv0zt.repcl.net/webhook/timmau',
        'primary_color' => '#3b82f6',
        'welcome_message' => 'Bạn hãy đặt câu hỏi với bác sĩ tại đây nhé'
    );
    
    add_option('wp_chatbot_settings', $default_settings);
}
register_activation_hook(__FILE__, 'wp_chatbot_activate');

/**
 * Gỡ cài đặt plugin
 */
function wp_chatbot_deactivate() {
    // Không làm gì khi gỡ cài đặt
}
register_deactivation_hook(__FILE__, 'wp_chatbot_deactivate');

/**
 * Xóa plugin
 */
function wp_chatbot_uninstall() {
    // Xóa các options khi xóa plugin
    delete_option('wp_chatbot_settings');
}
register_uninstall_hook(__FILE__, 'wp_chatbot_uninstall');
