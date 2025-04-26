<?php
/**
 * Quản lý trang cài đặt admin cho WP Chatbot
 */

// Ngăn chặn truy cập trực tiếp
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Thêm menu trong admin
 */
function wp_chatbot_add_admin_menu() {
    add_menu_page(
        __('WP Chatbot Settings', 'wp-chatbot'),
        __('WP Chatbot', 'wp-chatbot'),
        'manage_options',
        'wp-chatbot-settings',
        'wp_chatbot_settings_page',
        'dashicons-format-chat',
        100
    );
}
add_action('admin_menu', 'wp_chatbot_add_admin_menu');

/**
 * Đăng ký cài đặt
 */
function wp_chatbot_register_settings() {
    register_setting('wp_chatbot_settings_group', 'wp_chatbot_settings');
    
    add_settings_section(
        'wp_chatbot_main_section',
        __('Cài đặt Chatbot', 'wp-chatbot'),
        'wp_chatbot_main_section_callback',
        'wp-chatbot-settings'
    );
    
    add_settings_field(
        'webhook_url',
        __('Webhook URL', 'wp-chatbot'),
        'wp_chatbot_webhook_url_callback',
        'wp-chatbot-settings',
        'wp_chatbot_main_section'
    );
    
    add_settings_field(
        'primary_color',
        __('Màu sắc chủ đạo', 'wp-chatbot'),
        'wp_chatbot_primary_color_callback',
        'wp-chatbot-settings',
        'wp_chatbot_main_section'
    );
    
    add_settings_field(
        'welcome_message',
        __('Tin nhắn chào mừng', 'wp-chatbot'),
        'wp_chatbot_welcome_message_callback',
        'wp-chatbot-settings',
        'wp_chatbot_main_section'
    );
}
add_action('admin_init', 'wp_chatbot_register_settings');

/**
 * Callback cho section
 */
function wp_chatbot_main_section_callback() {
    echo '<p>' . __('Cấu hình các tùy chọn cho chatbot của bạn.', 'wp-chatbot') . '</p>';
}

/**
 * Callback cho field webhook URL
 */
function wp_chatbot_webhook_url_callback() {
    $options = get_option('wp_chatbot_settings');
    $webhook_url = isset($options['webhook_url']) ? $options['webhook_url'] : '';
    ?>
    <input type="url" id="webhook_url" name="wp_chatbot_settings[webhook_url]" value="<?php echo esc_url($webhook_url); ?>" class="regular-text" />
    <p class="description"><?php _e('URL webhook của n8n để gửi và nhận tin nhắn.', 'wp-chatbot'); ?></p>
    <?php
}

/**
 * Callback cho field màu sắc
 */
function wp_chatbot_primary_color_callback() {
    $options = get_option('wp_chatbot_settings');
    $primary_color = isset($options['primary_color']) ? $options['primary_color'] : '#3b82f6';
    ?>
    <input type="color" id="primary_color" name="wp_chatbot_settings[primary_color]" value="<?php echo esc_attr($primary_color); ?>" />
    <p class="description"><?php _e('Chọn màu sắc chủ đạo cho chatbot.', 'wp-chatbot'); ?></p>
    <?php
}

/**
 * Callback cho field tin nhắn chào mừng
 */
function wp_chatbot_welcome_message_callback() {
    $options = get_option('wp_chatbot_settings');
    $welcome_message = isset($options['welcome_message']) ? $options['welcome_message'] : 'Bạn hãy đặt câu hỏi với bác sĩ tại đây nhé';
    ?>
    <textarea id="welcome_message" name="wp_chatbot_settings[welcome_message]" rows="3" class="large-text"><?php echo esc_textarea($welcome_message); ?></textarea>
    <p class="description"><?php _e('Tin nhắn chào mừng khi người dùng mở chatbot lần đầu.', 'wp-chatbot'); ?></p>
    <?php
}

/**
 * Hiển thị trang cài đặt
 */
function wp_chatbot_settings_page() {
    // Kiểm tra quyền truy cập
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Hiển thị thông báo lưu cài đặt
    if (isset($_GET['settings-updated'])) {
        add_settings_error('wp_chatbot_messages', 'wp_chatbot_message', __('Cài đặt đã được lưu.', 'wp-chatbot'), 'updated');
    }
    
    // Hiển thị lỗi/thông báo
    settings_errors('wp_chatbot_messages');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            settings_fields('wp_chatbot_settings_group');
            do_settings_sections('wp-chatbot-settings');
            submit_button(__('Lưu cài đặt', 'wp-chatbot'));
            ?>
        </form>
        
        <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px; background-color: #fff; border: 1px solid #ccd0d4; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
            <h2><?php _e('Hướng dẫn sử dụng', 'wp-chatbot'); ?></h2>
            <p><?php _e('Plugin WP Chatbot sẽ hiển thị một chatbot ở góc dưới bên phải của trang web của bạn.', 'wp-chatbot'); ?></p>
            <ol>
                <li><?php _e('Cấu hình <strong>Webhook URL</strong> để kết nối với n8n hoặc dịch vụ xử lý tin nhắn của bạn.', 'wp-chatbot'); ?></li>
                <li><?php _e('Tùy chỉnh <strong>Màu sắc chủ đạo</strong> để phù hợp với giao diện website của bạn.', 'wp-chatbot'); ?></li>
                <li><?php _e('Thay đổi <strong>Tin nhắn chào mừng</strong> hiển thị khi người dùng mở chatbot lần đầu.', 'wp-chatbot'); ?></li>
            </ol>
        </div>
    </div>
    <?php
}
