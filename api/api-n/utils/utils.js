const logoutUser = `
        UPDATE users 
        SET is_logged = false 
    `;

const getUserAndLevel = `
        SELECT u.name, u.last_login, l.name AS level FROM users u
        INNER JOIN levels l
        ON u.level = l.id
        WHERE user_name = $1 AND password = $2
    `;

function returnErrorServer(res) {
    return res
      .status(500)
      .json({message: 'Server ERROR', code: 'D00B1', status: false});
};

module.exports = { returnErrorServer, getUserAndLevel, logoutUser };